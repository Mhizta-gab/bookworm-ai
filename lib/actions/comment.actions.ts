"use server";
// Comment server actions — getComments, createComment, likeComment
import { connectDB } from "@/database/mongoose";
import Comment from "@/database/models/comment.model";

export async function getComments(bookId: string) {
  await connectDB();
  // TODO: Return comments for bookId (with threaded replies)
  return [];
}

export async function createComment(data: {
  bookId: string;
  clerkId: string;
  content: string;
  parentId?: string;
}) {
  await connectDB();
  // TODO: Create comment
  return null;
}

export async function likeComment(commentId: string, clerkId: string) {
  await connectDB();
  // TODO: Toggle like on comment
}
