"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";
import { getBillingPeriodStart } from "@/lib/utils";
import { PLAN_LIMITS, PLANS, type PlanType } from "@/lib/subscription-constants";

export async function getUserPlan(): Promise<PlanType> {
  const { has, userId } = await auth();

  if (!userId) return PLANS.FREE;
  if (has({ plan: "pro" })) return PLANS.PRO;
  if (has({ plan: "standard" })) return PLANS.STANDARD;

  return PLANS.FREE;
}

export async function getPlanLimits() {
  const plan = await getUserPlan();
  return PLAN_LIMITS[plan];
}

export async function getVoiceUsage() {
  await connectDB();
  const { userId } = await auth();
  const plan = await getUserPlan();
  const limits = PLAN_LIMITS[plan];
  const billingPeriodStart = getBillingPeriodStart();

  if (!userId) {
    return {
      plan,
      limits,
      sessionsUsed: 0,
      minutesUsed: 0,
      billingPeriodStart,
    };
  }

  const [sessionsUsed, usage] = await Promise.all([
    VoiceSession.countDocuments({ clerkId: userId, billingPeriodStart }),
    VoiceSession.aggregate<{ totalSeconds: number }>([
      { $match: { clerkId: userId, billingPeriodStart } },
      { $group: { _id: null, totalSeconds: { $sum: { $ifNull: ["$durationSeconds", 0] } } } },
    ]),
  ]);

  return {
    plan,
    limits,
    sessionsUsed,
    minutesUsed: Math.ceil((usage[0]?.totalSeconds ?? 0) / 60),
    billingPeriodStart,
  };
}
