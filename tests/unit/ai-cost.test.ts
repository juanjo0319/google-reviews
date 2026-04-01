import { describe, it, expect } from "vitest";

// We test the cost calculation logic directly since it's a pure function.
// It's private in usage.ts, so we replicate it here for unit testing.

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
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

describe("AI cost calculation", () => {
  it("calculates Haiku 4.5 costs correctly", () => {
    // 1000 input tokens at $1/MTok + 500 output tokens at $5/MTok
    const cost = calculateCost("claude-haiku-4-5-20251001", 1000, 500);
    expect(cost).toBeCloseTo(0.001 + 0.0025, 6); // 0.0035
  });

  it("calculates Sonnet 4.6 costs correctly", () => {
    // 1000 input at $3/MTok + 500 output at $15/MTok
    const cost = calculateCost("claude-sonnet-4-6", 1000, 500);
    expect(cost).toBeCloseTo(0.003 + 0.0075, 6); // 0.0105
  });

  it("uses default pricing for unknown models", () => {
    const cost = calculateCost("unknown-model", 1_000_000, 1_000_000);
    // Default: $3 input + $15 output = $18
    expect(cost).toBeCloseTo(18.0, 2);
  });

  it("returns 0 for zero tokens", () => {
    expect(calculateCost("claude-haiku-4-5-20251001", 0, 0)).toBe(0);
  });

  it("handles large token counts correctly", () => {
    // 1M input tokens of Haiku = $1.00
    const cost = calculateCost("claude-haiku-4-5-20251001", 1_000_000, 0);
    expect(cost).toBeCloseTo(1.0, 4);
  });

  it("Sonnet costs more than Haiku for same tokens", () => {
    const haikuCost = calculateCost("claude-haiku-4-5-20251001", 10000, 5000);
    const sonnetCost = calculateCost("claude-sonnet-4-6", 10000, 5000);
    expect(sonnetCost).toBeGreaterThan(haikuCost);
  });
});
