export interface PlanLimits {
  locations: number;
  reviewsPerMonth: number;
  teamMembers: number;
  aiResponsesPerMonth: number;
}

export interface PlanConfig {
  name: string;
  price: number | null;
  priceId: string;
  limits: PlanLimits;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    name: "Free",
    price: 0,
    priceId: "",
    limits: {
      locations: 1,
      reviewsPerMonth: 25,
      teamMembers: 1,
      aiResponsesPerMonth: 10,
    },
  },
  starter: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    limits: {
      locations: 3,
      reviewsPerMonth: 100,
      teamMembers: 2,
      aiResponsesPerMonth: 50,
    },
  },
  pro: {
    name: "Pro",
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    limits: {
      locations: 10,
      reviewsPerMonth: 1000,
      teamMembers: 10,
      aiResponsesPerMonth: 500,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    limits: {
      locations: Infinity,
      reviewsPerMonth: Infinity,
      teamMembers: Infinity,
      aiResponsesPerMonth: Infinity,
    },
  },
};

/** Ordered list of plan tiers from lowest to highest. */
export const PLAN_ORDER = ["free", "starter", "pro", "enterprise"];

export function getPlanByTier(tier: string): PlanConfig {
  return PLANS[tier] ?? PLANS.free;
}

export function getNextPlan(currentTier: string): PlanConfig | null {
  const idx = PLAN_ORDER.indexOf(currentTier);
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null;
  return PLANS[PLAN_ORDER[idx + 1]];
}
