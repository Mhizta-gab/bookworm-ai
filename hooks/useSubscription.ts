"use client";

import { useState, useEffect } from "react";
import { getVoiceUsage } from "@/lib/actions/subscription.actions";
import type { PlanLimits, PlanType } from "@/lib/subscription-constants";

interface SubscriptionState {
  plan: PlanType;
  limits: PlanLimits;
  sessionsUsed: number;
  minutesUsed: number;
  billingPeriodStart: Date;
  isLoading: boolean;
}

// Sensible free-tier defaults while the server action loads
const DEFAULT_LIMITS: PlanLimits = {
  monthlySessions: 3,
  monthlyMinutes: 30,
  maxDurationPerSession: 10,
};

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    limits: DEFAULT_LIMITS,
    sessionsUsed: 0,
    minutesUsed: 0,
    billingPeriodStart: new Date(),
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    getVoiceUsage()
      .then((usage) => {
        if (cancelled) return;
        setState({
          plan: usage.plan,
          limits: usage.limits,
          sessionsUsed: usage.sessionsUsed,
          minutesUsed: usage.minutesUsed,
          billingPeriodStart: usage.billingPeriodStart,
          isLoading: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load subscription info:", err);
        setState((prev) => ({ ...prev, isLoading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
