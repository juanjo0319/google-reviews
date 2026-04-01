import { getAnthropicClient } from "./client";
import { analyzeReviewSentiment, type SentimentResult } from "./sentiment";
import { logAIUsage } from "./usage";

interface ReviewForAnalysis {
  id: string;
  comment: string;
  starRating: number;
}

const BATCH_THRESHOLD = 50;
const CONCURRENCY_LIMIT = 5;

/**
 * Analyze multiple reviews. Uses concurrent individual calls for small batches
 * and the Message Batches API for larger ones (50% cost discount).
 */
export async function batchAnalyzeReviews(
  orgId: string,
  reviews: ReviewForAnalysis[]
): Promise<Map<string, SentimentResult>> {
  if (reviews.length === 0) return new Map();

  if (reviews.length < BATCH_THRESHOLD) {
    return analyzeWithConcurrency(orgId, reviews);
  }

  return analyzeWithBatchAPI(orgId, reviews);
}

/**
 * Small batch: concurrent individual calls with a concurrency limit.
 */
async function analyzeWithConcurrency(
  orgId: string,
  reviews: ReviewForAnalysis[]
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();
  const queue = [...reviews];

  async function worker() {
    while (queue.length > 0) {
      const review = queue.shift();
      if (!review) break;

      try {
        const result = await analyzeReviewSentiment(
          review.comment,
          review.starRating,
          orgId,
          review.id
        );
        results.set(review.id, result);
      } catch (err) {
        console.error(
          `Sentiment analysis failed for review ${review.id}:`,
          err
        );
      }
    }
  }

  // Launch concurrent workers
  const workers = Array.from(
    { length: Math.min(CONCURRENCY_LIMIT, reviews.length) },
    () => worker()
  );
  await Promise.all(workers);

  return results;
}

/**
 * Large batch: use Claude's Message Batches API at 50% cost discount.
 */
async function analyzeWithBatchAPI(
  orgId: string,
  reviews: ReviewForAnalysis[]
): Promise<Map<string, SentimentResult>> {
  const client = getAnthropicClient();
  const results = new Map<string, SentimentResult>();

  const SYSTEM_PROMPT = `You are a review sentiment analysis expert. Analyze the given Google review and return JSON with: sentiment ("positive"|"neutral"|"negative"), confidence (0-1), key_themes, key_positives, key_negatives, requires_urgent_response (boolean), is_spam (boolean).`;

  // Create batch requests
  const requests = reviews.map((review) => ({
    custom_id: review.id,
    params: {
      model: "claude-haiku-4-5-20251001" as const,
      max_tokens: 512,
      system: [
        {
          type: "text" as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      messages: [
        {
          role: "user" as const,
          content: `Analyze this ${review.starRating}-star Google review:\n\n"${review.comment}"`,
        },
      ],
    },
  }));

  try {
    // Create the batch
    const batch = await client.messages.batches.create({
      requests,
    });

    // Poll for completion
    let completedBatch = batch;
    while (
      completedBatch.processing_status === "in_progress"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      completedBatch = await client.messages.batches.retrieve(batch.id);
    }

    // Retrieve results
    const batchResults = await client.messages.batches.results(batch.id);
    for await (const entry of batchResults) {
      if (entry.result.type === "succeeded") {
        const message = entry.result.message;
        const textBlock = message.content.find(
          (b: { type: string }) => b.type === "text"
        );
        if (textBlock && textBlock.type === "text") {
          try {
            const parsed: SentimentResult = JSON.parse(textBlock.text);
            results.set(entry.custom_id, parsed);

            // Log usage for each result
            await logAIUsage(
              orgId,
              "claude-haiku-4-5-20251001",
              message.usage.input_tokens,
              message.usage.output_tokens,
              "sentiment_analysis_batch",
              entry.custom_id
            );
          } catch {
            console.error(
              `Failed to parse batch result for ${entry.custom_id}`
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("Batch API error, falling back to concurrent:", err);
    // Fallback to concurrent individual calls
    return analyzeWithConcurrency(orgId, reviews);
  }

  return results;
}
