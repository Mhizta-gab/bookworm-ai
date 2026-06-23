"use client";

import { useEffect, useState } from "react";
import { getVoiceUsage } from "@/lib/actions/subscription.actions";
import type { PlanLimits, PlanType } from "@/lib/subscription-constants";

type SubscriptionInfo = {
  plan: PlanType;
  limits: PlanLimits;
  sessionsUsed: number;
  minutesUsed: number;
  billingPeriodStart: Date;
};

export function useSubscription() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getVoiceUsage()
      .then((usage) => {
        if (isMounted) setInfo(usage);
      })
      .catch((error) => {
        console.error("Failed to load voice usage:", error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    info,
    limits: info?.limits,
    isLoading,
  };
}
