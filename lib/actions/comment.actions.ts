"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import Comment from "@/database/models/comment.model";
import { revalidatePath } from "next/cache";

function serialize<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export type CommentData = {
  _id: string;
  bookId: string;
  clerkId: string;
  authorName: string;
  authorImageUrl: string;
  content: string;
  likes: string[];
  createdAt: string;
};

export async function getComments(bookId: string): Promise<CommentData[]> {
  await connectDB();

  const raw = await Comment.find({ bookId, parentId: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  if (!raw.length) return [];

  // Fetch author display info from Clerk in parallel
  const clerkIds = [...new Set(raw.map((c) => c.clerkId))];
  const client = await clerkClient();

  const userMap = new Map<string, { name: string; imageUrl: string }>();
  await Promise.all(
    clerkIds.map(async (id) => {
      try {
        const user = await client.users.getUser(id);
        userMap.set(id, {
          name: user.fullName ?? user.username ?? "Reader",
          imageUrl: user.imageUrl ?? "",
        });
      } catch {
        userMap.set(id, { name: "Reader", imageUrl: "" });
      }
    })
  );

  return serialize(
    raw.map((c) => ({
      _id: String(c._id),
      bookId: String(c.bookId),
      clerkId: c.clerkId,
      authorName: userMap.get(c.clerkId)?.name ?? "Reader",
      authorImageUrl: userMap.get(c.clerkId)?.imageUrl ?? "",
      content: c.content,
      likes: c.likes ?? [],
      createdAt: (c.createdAt as Date).toISOString(),
    }))
  );
}

export async function createComment(bookId: string, content: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Sign in to leave a comment." };
  if (!content.trim()) return { success: false, error: "Comment cannot be empty." };
  if (content.length > 1200) return { success: false, error: "Comment is too long (max 1200 chars)." };

  await connectDB();
  await Comment.create({ bookId, clerkId: userId, content: content.trim(), likes: [] });

  revalidatePath(`/dashboard/books/[slug]`, "page");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };

  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) return { success: false, error: "Comment not found." };
  if (comment.clerkId !== userId) return { success: false, error: "Not your comment." };

  await comment.deleteOne();
  revalidatePath(`/dashboard/books/[slug]`, "page");
  return { success: true };
}

export async function toggleLike(commentId: string): Promise<{ success: boolean; liked?: boolean; count?: number }> {
  const { userId } = await auth();
  if (!userId) return { success: false };

  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) return { success: false };

  const hasLiked = comment.likes.includes(userId);
  if (hasLiked) {
    comment.likes = comment.likes.filter((id: string) => id !== userId);
  } else {
    comment.likes.push(userId);
  }
  await comment.save();

  return { success: true, liked: !hasLiked, count: comment.likes.length };
}
