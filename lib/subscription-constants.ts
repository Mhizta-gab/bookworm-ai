export const PLANS = {
  FREE: "free",
  STANDARD: "standard",
  PRO: "pro",
} as const;

export type PlanType = (typeof PLANS)[keyof typeof PLANS];

export type PlanLimits = {
  monthlySessions: number;
  monthlyMinutes: number;
  maxDurationPerSession: number;
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PLANS.FREE]: {
    monthlySessions: 3,
    monthlyMinutes: 30,
    maxDurationPerSession: 10,
  },
  [PLANS.STANDARD]: {
    monthlySessions: 30,
    monthlyMinutes: 600,
    maxDurationPerSession: 30,
  },
  [PLANS.PRO]: {
    monthlySessions: 300,
    monthlyMinutes: 3000,
    maxDurationPerSession: 60,
  },
};
