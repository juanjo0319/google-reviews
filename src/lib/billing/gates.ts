import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByTier, getNextPlan, type PlanLimits } from "@/lib/stripe/config";

export interface FeatureCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
  message?: string;
  nextPlan?: string;
}

/**
 * Get the current plan's limits for an organization.
 */
export async function getOrgLimits(orgId: string): Promise<PlanLimits> {
  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("plan_tier")
    .eq("id", orgId)
    .single();

  const tier = org?.plan_tier ?? "free";
  return getPlanByTier(tier).limits;
}

/**
 * Get current usage counts for the organization.
 */
export async function getUsageCounts(orgId: string): Promise<{
  locations: number;
  reviewsThisMonth: number;
  teamMembers: number;
  aiResponsesThisMonth: number;
}> {
  const supabase = createAdminClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [locations, members, monthlyReviews, monthlyAiResponses] =
    await Promise.all([
      supabase
        .from("locations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
      supabase
        .from("organization_members")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("responses")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("is_ai_generated", true)
        .gte("created_at", startOfMonth.toISOString()),
    ]);

  return {
    locations: locations.count ?? 0,
    reviewsThisMonth: monthlyReviews.count ?? 0,
    teamMembers: members.count ?? 0,
    aiResponsesThisMonth: monthlyAiResponses.count ?? 0,
  };
}

/**
 * Check if an organization can use a specific feature.
 */
export async function checkFeatureAccess(
  orgId: string,
  feature: keyof PlanLimits,
  currentCount?: number
): Promise<FeatureCheckResult> {
  const limits = await getOrgLimits(orgId);
  const limit = limits[feature];

  // Get current count if not provided
  let current = currentCount ?? 0;
  if (currentCount === undefined) {
    const usage = await getUsageCounts(orgId);
    switch (feature) {
      case "locations":
        current = usage.locations;
        break;
      case "reviewsPerMonth":
        current = usage.reviewsThisMonth;
        break;
      case "teamMembers":
        current = usage.teamMembers;
        break;
      case "aiResponsesPerMonth":
        current = usage.aiResponsesThisMonth;
        break;
    }
  }

  if (limit === Infinity || current < limit) {
    return { allowed: true, limit, current };
  }

  // Find the next plan that allows this feature
  const supabase = createAdminClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("plan_tier")
    .eq("id", orgId)
    .single();

  const currentTier = org?.plan_tier ?? "free";
  const next = getNextPlan(currentTier);

  const featureLabels: Record<string, string> = {
    locations: "locations",
    reviewsPerMonth: "reviews this month",
    teamMembers: "team members",
    aiResponsesPerMonth: "AI responses this month",
  };

  return {
    allowed: false,
    limit,
    current,
    message:
      "You've reached your " +
      featureLabels[feature] +
      " limit (" +
      limit +
      "). Upgrade to " +
      (next?.name ?? "a higher plan") +
      " for more.",
    nextPlan: next ? currentTier : undefined,
  };
}

/**
 * Require an organization to have at least a specific plan tier.
 * Throws if the org doesn't meet the requirement.
 */
export async function requirePlan(
  orgId: string,
  minPlan: "starter" | "pro" | "enterprise"
): Promise<void> {
  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("plan_tier")
    .eq("id", orgId)
    .single();

  const TIER_RANK: Record<string, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    enterprise: 3,
  };

  const currentRank = TIER_RANK[org?.plan_tier ?? "free"] ?? 0;
  const requiredRank = TIER_RANK[minPlan] ?? 1;

  if (currentRank < requiredRank) {
    throw new Error(
      "This feature requires the " + minPlan + " plan or higher."
    );
  }
}
