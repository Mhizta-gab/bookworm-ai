"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import Comment from "@/database/models/comment.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

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
  parentId?: string;
  replies?: CommentData[];
};

export async function getComments(bookId: string): Promise<CommentData[]> {
  await connectDB();

  // Fetch all comments for this book (both top-level and replies)
  const raw = await Comment.find({ bookId })
    .sort({ createdAt: 1 })
    .limit(150)
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

  const formattedComments: CommentData[] = raw.map((c) => ({
    _id: String(c._id),
    bookId: String(c.bookId),
    clerkId: c.clerkId,
    authorName: userMap.get(c.clerkId)?.name ?? "Reader",
    authorImageUrl: userMap.get(c.clerkId)?.imageUrl ?? "",
    content: c.content,
    likes: c.likes ?? [],
    createdAt: (c.createdAt as Date).toISOString(),
    parentId: c.parentId ? String(c.parentId) : undefined,
    replies: [],
  }));

  // Build top-level comments tree with nested replies
  const commentMap = new Map<string, CommentData>();
  formattedComments.forEach((item) => {
    commentMap.set(item._id, item);
  });

  const rootComments: CommentData[] = [];
  formattedComments.forEach((item) => {
    if (item.parentId && commentMap.has(item.parentId)) {
      const parent = commentMap.get(item.parentId)!;
      if (!parent.replies) parent.replies = [];
      parent.replies.push(item);
    } else {
      rootComments.push(item);
    }
  });

  // Sort root comments with newest first
  rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return serialize(rootComments);
}

export async function createComment(bookId: string, content: string, parentId?: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Sign in to leave a comment." };
  if (!content.trim()) return { success: false, error: "Comment cannot be empty." };
  if (content.length > 1200) return { success: false, error: "Comment is too long (max 1200 chars)." };

  await connectDB();
  
  const commentData: any = {
    bookId,
    clerkId: userId,
    content: content.trim(),
    likes: [],
  };

  if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
    commentData.parentId = parentId;
  }

  await Comment.create(commentData);

  revalidatePath(`/dashboard/books/[slug]`, "page");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return { success: false, error: "Invalid comment ID." };
  }

  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) return { success: false, error: "Comment not found." };
  if (comment.clerkId !== userId) return { success: false, error: "Not your comment." };

  // Also delete any replies to this comment
  await Comment.deleteMany({ parentId: comment._id });
  await comment.deleteOne();
  revalidatePath(`/dashboard/books/[slug]`, "page");
  return { success: true };
}

export async function toggleLike(commentId: string): Promise<{ success: boolean; liked?: boolean; count?: number }> {
  const { userId } = await auth();
  if (!userId) return { success: false };

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return { success: false };
  }

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


