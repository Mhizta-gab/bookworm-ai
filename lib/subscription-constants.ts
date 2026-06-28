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
    monthlyMinutes: 15,
    maxDurationPerSession: 5,
  },
  [PLANS.STANDARD]: {
    monthlySessions: 15,
    monthlyMinutes: 120,
    maxDurationPerSession: 15,
  },
  [PLANS.PRO]: {
    monthlySessions: 45,
    monthlyMinutes: 450,
    maxDurationPerSession: 30,
  },
};
