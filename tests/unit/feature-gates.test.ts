import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase admin client
const mockSingle = vi.fn();
const mockHead = vi.fn(() => ({ count: 0 }));
const mockEq = vi.fn().mockReturnThis();
const mockGte = vi.fn().mockReturnThis();
const mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle, head: mockHead }));
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  gte: mockGte,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { getOrgLimits } from "@/lib/billing/gates";
import { PLANS } from "@/lib/stripe/config";

describe("getOrgLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain mocks
    mockEq.mockReturnThis();
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle, head: mockHead });
    mockFrom.mockReturnValue({ select: mockSelect, eq: mockEq, gte: mockGte });
  });

  it("returns free plan limits when org has no plan", async () => {
    mockSingle.mockResolvedValue({ data: { plan_tier: "free" }, error: null });
    const limits = await getOrgLimits("org-001");
    expect(limits).toEqual(PLANS.free.limits);
  });

  it("returns pro plan limits for pro org", async () => {
    mockSingle.mockResolvedValue({ data: { plan_tier: "pro" }, error: null });
    const limits = await getOrgLimits("org-001");
    expect(limits).toEqual(PLANS.pro.limits);
  });

  it("returns enterprise limits (Infinity) for enterprise org", async () => {
    mockSingle.mockResolvedValue({
      data: { plan_tier: "enterprise" },
      error: null,
    });
    const limits = await getOrgLimits("org-001");
    expect(limits.locations).toBe(Infinity);
    expect(limits.reviewsPerMonth).toBe(Infinity);
  });

  it("defaults to free plan when org not found", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const limits = await getOrgLimits("nonexistent");
    expect(limits).toEqual(PLANS.free.limits);
  });
});
