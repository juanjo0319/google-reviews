import { createAdminClient } from "@/lib/supabase/admin";

// --- Pricing (per million tokens) ---

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
};

// --- Plan AI budget limits (USD/month) ---

const PLAN_BUDGET: Record<string, number> = {
  free: 2,
  starter: 5,
  pro: 25,
  enterprise: Infinity,
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] ?? { input: 3.0, output: 15.0 };
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

/**
 * Log an AI usage event to the ai_usage_log table.
 */
export async function logAIUsage(
  orgId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  operation: string,
  reviewId?: string
): Promise<void> {
  const costUsd = calculateCost(model, inputTokens, outputTokens);
  const supabase = createAdminClient();

  await supabase.from("ai_usage_log").insert({
    organization_id: orgId,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUsd,
    operation,
    review_id: reviewId ?? null,
  });
}

/**
 * Get AI usage for an organization within a date range.
 */
export async function getOrgAIUsage(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  byOperation: Record<string, { count: number; cost: number }>;
}> {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from("ai_usage_log")
    .select("input_tokens, output_tokens, cost_usd, operation")
    .eq("organization_id", orgId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (!logs?.length) {
    return { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, byOperation: {} };
  }

  const byOperation: Record<string, { count: number; cost: number }> = {};
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;

  for (const log of logs) {
    totalInputTokens += log.input_tokens ?? 0;
    totalOutputTokens += log.output_tokens ?? 0;
    totalCost += Number(log.cost_usd ?? 0);

    const op = log.operation ?? "unknown";
    if (!byOperation[op]) byOperation[op] = { count: 0, cost: 0 };
    byOperation[op].count++;
    byOperation[op].cost += Number(log.cost_usd ?? 0);
  }

  return { totalInputTokens, totalOutputTokens, totalCost, byOperation };
}

/**
 * Check if the organization has exceeded their plan's AI usage budget.
 * Returns { allowed: true } or { allowed: false, reason, used, limit }.
 */
export async function checkAIBudget(
  orgId: string
): Promise<
  | { allowed: true }
  | { allowed: false; reason: string; used: number; limit: number }
> {
  const supabase = createAdminClient();

  // Get org plan tier
  const { data: org } = await supabase
    .from("organizations")
    .select("plan_tier")
    .eq("id", orgId)
    .single();

  const planTier = org?.plan_tier ?? "free";
  const budget = PLAN_BUDGET[planTier] ?? PLAN_BUDGET.free;

  if (budget === Infinity) return { allowed: true };

  // Get current month usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const usage = await getOrgAIUsage(orgId, startOfMonth, now);

  if (usage.totalCost >= budget) {
    return {
      allowed: false,
      reason: `AI budget exceeded for ${planTier} plan ($${budget}/mo)`,
      used: usage.totalCost,
      limit: budget,
    };
  }

  return { allowed: true };
}

/**
 * Get a summary of the current month's AI usage for display.
 */
export async function getAIUsageSummary(orgId: string): Promise<{
  currentMonthCost: number;
  currentMonthInputTokens: number;
  currentMonthOutputTokens: number;
  budgetLimit: number;
  budgetUsedPercent: number;
  byOperation: Record<string, { count: number; cost: number }>;
  dailyAverage: number;
}> {
  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("plan_tier")
    .eq("id", orgId)
    .single();

  const planTier = org?.plan_tier ?? "free";
  const budget = PLAN_BUDGET[planTier] ?? PLAN_BUDGET.free;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfMonth = now.getDate();

  const usage = await getOrgAIUsage(orgId, startOfMonth, now);

  return {
    currentMonthCost: usage.totalCost,
    currentMonthInputTokens: usage.totalInputTokens,
    currentMonthOutputTokens: usage.totalOutputTokens,
    budgetLimit: budget === Infinity ? -1 : budget,
    budgetUsedPercent:
      budget === Infinity ? 0 : Math.round((usage.totalCost / budget) * 100),
    byOperation: usage.byOperation,
    dailyAverage: dayOfMonth > 0 ? usage.totalCost / dayOfMonth : 0,
  };
}
