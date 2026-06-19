"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";
import { getBillingPeriodStart } from "@/lib/utils";
import { getVoiceUsage } from "@/lib/actions/subscription.actions";

// ─── Start session ────────────────────────────────────────────────────────────

export async function startVoiceSession(bookId: string): Promise<{
  success: boolean;
  sessionId?: string;
  error?: string;
  isBillingError?: boolean;
  maxDurationMinutes?: number;
}> {
  await connectDB();
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be signed in to start a voice session." };
  }

  // ── Check plan limits before creating the session ──────────────────────────
  const usage = await getVoiceUsage();
  const { limits, sessionsUsed, minutesUsed } = usage;

  if (sessionsUsed >= limits.monthlySessions) {
    return {
      success: false,
      isBillingError: true,
      error: `Monthly session limit reached (${limits.monthlySessions} sessions). Upgrade your plan to continue.`,
    };
  }

  if (minutesUsed >= limits.monthlyMinutes) {
    return {
      success: false,
      isBillingError: true,
      error: `Monthly minute limit reached (${limits.monthlyMinutes} minutes). Upgrade your plan to continue.`,
    };
  }

  // ── Create the session record ──────────────────────────────────────────────
  const session = await VoiceSession.create({
    clerkId: userId,
    bookId,
    startedAt: new Date(),
    billingPeriodStart: getBillingPeriodStart(),
    durationSeconds: 0,
  });

  return {
    success: true,
    sessionId: session._id.toString(),
    maxDurationMinutes: limits.maxDurationPerSession,
  };
}

// ─── End session ─────────────────────────────────────────────────────────────

export async function endVoiceSession(sessionId: string, durationSeconds = 0) {
  await connectDB();
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be signed in to end a voice session." };
  }

  const result = await VoiceSession.findOneAndUpdate(
    { _id: sessionId, clerkId: userId },
    { endedAt: new Date(), durationSeconds },
    { returnDocument: "after" }
  );

  if (!result) {
    return { success: false, error: "Voice session not found." };
  }

  return { success: true };
}
