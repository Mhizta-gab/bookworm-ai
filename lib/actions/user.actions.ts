"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import VoiceSession from "@/database/models/voice-session.model";
import Follow from "@/database/models/follow.model";
import { revalidatePath } from "next/cache";

function serialize<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function formatCleanHandle(fullName?: string | null, username?: string | null, clerkId?: string): string {
  if (username && !username.startsWith("user_")) {
    return username;
  }
  if (fullName && fullName.trim()) {
    return fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }
  if (clerkId) {
    return `reader_${clerkId.slice(-6).toLowerCase()}`;
  }
  return "reader";
}

export type UserProfileBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  persona: string;
  genre: string;
  status: string;
  accent: string;
  coverUrl: string;
};

export type UserProfileData = {
  id: string;
  name: string;
  username: string;
  cleanHandle: string;
  imageUrl: string;
  bio: string;
  totalBooks: number;
  totalSessions: number;
  totalMinutes: number;
  favoriteGenres: string[];
  uploadedBooks: UserProfileBook[];
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
};

export async function getUserProfile(slug: string): Promise<UserProfileData | null> {
  const { userId: currentUserId } = await auth();
  const client = await clerkClient();
  let clerkUser = null;

  // 1. Try finding by Clerk User ID directly
  if (slug.startsWith("user_")) {
    clerkUser = await client.users.getUser(slug).catch(() => null);
  }

  // 2. Try finding by username
  if (!clerkUser) {
    try {
      const response = await client.users.getUserList({ username: [slug] });
      const users = Array.isArray(response) ? response : (response as any).data || [];
      if (users.length > 0) {
        clerkUser = users[0];
      }
    } catch (err) {
      console.error("Clerk getUserList by username error:", err);
    }
  }

  // 3. Fallback: search by query
  if (!clerkUser) {
    try {
      const response = await client.users.getUserList({ query: slug });
      const users = Array.isArray(response) ? response : (response as any).data || [];
      if (users.length > 0) {
        clerkUser = users[0];
      }
    } catch (err) {
      console.error("Clerk getUserList by query error:", err);
    }
  }

  if (!clerkUser) return null;

  await connectDB();

  const [totalBooks, totalSessions, usage, books, followersCount, followingCount, followRecord] = await Promise.all([
    Book.countDocuments({ clerkId: clerkUser.id }),
    VoiceSession.countDocuments({ clerkId: clerkUser.id }),
    VoiceSession.aggregate<{ totalSeconds: number }>([
      { $match: { clerkId: clerkUser.id } },
      { $group: { _id: null, totalSeconds: { $sum: { $ifNull: ["$durationSeconds", 0] } } } },
    ]),
    Book.find({ clerkId: clerkUser.id }).sort({ createdAt: -1 }).lean(),
    Follow.countDocuments({ followingId: clerkUser.id }),
    Follow.countDocuments({ followerId: clerkUser.id }),
    currentUserId ? Follow.findOne({ followerId: currentUserId, followingId: clerkUser.id }).lean() : Promise.resolve(null),
  ]);

  // Extract favorite genres
  const genresMap = new Map<string, number>();
  books.forEach((b: any) => {
    if (b.genre) {
      genresMap.set(b.genre, (genresMap.get(b.genre) || 0) + 1);
    }
  });

  const favoriteGenres = Array.from(genresMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([genre]) => genre);

  const bio = (clerkUser.publicMetadata?.bio as string) || "";
  const totalSeconds = usage[0]?.totalSeconds ?? 0;
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const fullName = clerkUser.fullName || clerkUser.username || "Reader";
  const cleanHandle = formatCleanHandle(clerkUser.fullName, clerkUser.username, clerkUser.id);

  return serialize({
    id: clerkUser.id,
    name: fullName,
    username: clerkUser.username || slug,
    cleanHandle,
    imageUrl: clerkUser.imageUrl || "",
    bio,
    totalBooks,
    totalSessions,
    totalMinutes,
    favoriteGenres: favoriteGenres.length > 0 ? favoriteGenres : ["Non-fiction"],
    uploadedBooks: books.map((b: any) => ({
      id: String(b._id),
      slug: b.slug,
      title: b.title,
      author: b.author,
      persona: b.persona,
      genre: b.genre || "General",
      status: b.status || "Ready",
      accent: b.accent || "linear-gradient(135deg, #86a8ff 0%, #cdd8ff 100%)",
      coverUrl: b.coverUrl || "",
    })),
    followersCount,
    followingCount,
    isFollowing: Boolean(followRecord),
  });
}

export async function toggleFollow(targetUserId: string): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };
  if (userId === targetUserId) return { success: false, error: "Cannot follow yourself" };

  await connectDB();
  const existing = await Follow.findOne({ followerId: userId, followingId: targetUserId });

  if (existing) {
    await Follow.deleteOne({ _id: existing._id });
  } else {
    await Follow.create({ followerId: userId, followingId: targetUserId });
  }

  const followersCount = await Follow.countDocuments({ followingId: targetUserId });
  revalidatePath(`/dashboard/profile/[slug]`, "page");

  return {
    success: true,
    isFollowing: !existing,
    followersCount,
  };
}

export async function updateUserBio(bio: string): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        bio,
      },
    });
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update user bio:", err);
    return { success: false, error: err?.message || "Failed to update profile" };
  }
}

