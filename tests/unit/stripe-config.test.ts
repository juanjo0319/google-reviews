import { describe, it, expect } from "vitest";
import { getPlanByTier, getNextPlan, PLANS, PLAN_ORDER } from "@/lib/stripe/config";

describe("getPlanByTier", () => {
  it("returns correct plan for each tier", () => {
    expect(getPlanByTier("free").name).toBe("Free");
    expect(getPlanByTier("starter").name).toBe("Starter");
    expect(getPlanByTier("pro").name).toBe("Pro");
    expect(getPlanByTier("enterprise").name).toBe("Enterprise");
  });

  it("falls back to free for unknown tiers", () => {
    expect(getPlanByTier("unknown").name).toBe("Free");
    expect(getPlanByTier("").name).toBe("Free");
  });

  it("defines correct limits for each plan", () => {
    expect(PLANS.free.limits.locations).toBe(1);
    expect(PLANS.starter.limits.locations).toBe(3);
    expect(PLANS.pro.limits.locations).toBe(10);
    expect(PLANS.enterprise.limits.locations).toBe(Infinity);
  });

  it("has ascending limits across plans", () => {
    for (let i = 1; i < PLAN_ORDER.length; i++) {
      const prev = PLANS[PLAN_ORDER[i - 1]].limits;
      const curr = PLANS[PLAN_ORDER[i]].limits;
      expect(curr.locations).toBeGreaterThanOrEqual(prev.locations);
      expect(curr.reviewsPerMonth).toBeGreaterThanOrEqual(prev.reviewsPerMonth);
      expect(curr.aiResponsesPerMonth).toBeGreaterThanOrEqual(
        prev.aiResponsesPerMonth
      );
    }
  });
});

describe("getNextPlan", () => {
  it("returns the next tier for each plan", () => {
    expect(getNextPlan("free")?.name).toBe("Starter");
    expect(getNextPlan("starter")?.name).toBe("Pro");
    expect(getNextPlan("pro")?.name).toBe("Enterprise");
  });

  it("returns null for the highest tier", () => {
    expect(getNextPlan("enterprise")).toBeNull();
  });

  it("returns null for unknown tiers", () => {
    expect(getNextPlan("unknown")).toBeNull();
  });
});
