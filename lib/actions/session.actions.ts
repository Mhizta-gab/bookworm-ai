"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";
import { getBillingPeriodStart } from "@/lib/utils";

export async function startVoiceSession(bookId: string) {
  await connectDB();
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be signed in to start a voice session." };
  }

  const session = await VoiceSession.create({
    clerkId: userId,
    bookId,
    startedAt: new Date(),
    billingPeriodStart: getBillingPeriodStart(),
    durationSeconds: 0,
  });

  return { success: true, sessionId: session._id.toString() };
}

export async function endVoiceSession(sessionId: string, durationSeconds = 0) {
  await connectDB();
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be signed in to end a voice session." };
  }

  const result = await VoiceSession.findOneAndUpdate(
    { _id: sessionId, clerkId: userId },
    { endedAt: new Date(), durationSeconds },
    { new: true }
  );

  if (!result) {
    return { success: false, error: "Voice session not found." };
  }

  return { success: true };
}
