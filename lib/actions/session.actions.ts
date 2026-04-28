"use server";
// Voice session server actions — startVoiceSession, endVoiceSession
import { connectDB } from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";

export async function startVoiceSession(clerkId: string, bookId: string) {
  await connectDB();
  const now = new Date();
  const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // TODO: Create VoiceSession document
  return null;
}

export async function endVoiceSession(sessionId: string) {
  await connectDB();
  // TODO: Update VoiceSession with endedAt and durationSeconds
}
