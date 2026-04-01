import { getAnthropicClient } from "./client";
import { logAIUsage, checkAIBudget } from "./usage";

const SENTIMENT_MODEL = "claude-haiku-4-5-20251001";

export interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  key_themes: string[];
  key_positives: string[];
  key_negatives: string[];
  requires_urgent_response: boolean;
  is_spam: boolean;
}

const SYSTEM_PROMPT = `You are a review sentiment analysis expert for businesses. Analyze the given Google review and its star rating to determine sentiment, themes, and urgency.

Consider:
- The star rating as a strong signal (1-2 = likely negative, 3 = neutral, 4-5 = likely positive)
- But override based on text content (e.g., a 4-star review with mostly complaints should be neutral)
- Spam indicators: generic text, irrelevant content, promotional links, competitor mentions
- Urgent response needed: severe complaints, threats to report, health/safety issues, legal mentions
- Extract specific themes mentioned (service, quality, price, cleanliness, speed, staff, etc.)`;

/**
 * Analyze the sentiment of a single review using Claude Haiku 4.5.
 */
export async function analyzeReviewSentiment(
  reviewText: string,
  starRating: number,
  orgId: string,
  reviewId?: string
): Promise<SentimentResult> {
  // Check budget before making the API call
  const budgetCheck = await checkAIBudget(orgId);
  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.reason);
  }

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: SENTIMENT_MODEL,
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Analyze this ${starRating}-star Google review:\n\n"${reviewText}"`,
      },
    ],
    // @ts-expect-error - structured output schema
    output_format: {
      type: "json_schema",
      json_schema: {
        name: "sentiment_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            key_themes: {
              type: "array",
              items: { type: "string" },
            },
            key_positives: {
              type: "array",
              items: { type: "string" },
            },
            key_negatives: {
              type: "array",
              items: { type: "string" },
            },
            requires_urgent_response: { type: "boolean" },
            is_spam: { type: "boolean" },
          },
          required: [
            "sentiment",
            "confidence",
            "key_themes",
            "key_positives",
            "key_negatives",
            "requires_urgent_response",
            "is_spam",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  // Extract the JSON text from the response
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from sentiment analysis");
  }

  const result: SentimentResult = JSON.parse(textBlock.text);

  // Log usage
  await logAIUsage(
    orgId,
    SENTIMENT_MODEL,
    response.usage.input_tokens,
    response.usage.output_tokens,
    "sentiment_analysis",
    reviewId
  );

  return result;
}
