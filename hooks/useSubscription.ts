"use client";
// useSubscription — tracks Vapi usage for the current billing period
// Polls or caches the user's monthly minute usage

import { useState } from "react";

interface SubscriptionInfo {
  minutesUsed: number;
  minutesLimit: number;
  billingPeriodStart: Date;
}

export function useSubscription() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);

  // TODO: Fetch subscription/usage info from server action or API route

  return { info };
}
