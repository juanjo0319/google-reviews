import { getAnthropicClient } from "./client";
import { logAIUsage, checkAIBudget } from "./usage";
import { createAdminClient } from "@/lib/supabase/admin";

const RESPONSE_MODEL = "claude-sonnet-4-6";

export interface RegenerateOptions {
  adjustTone?: "more formal" | "more casual";
  shorterOrLonger?: "shorter" | "longer";
  additionalInstructions?: string;
}

/**
 * Regenerate an alternative response based on an existing one.
 */
export async function regenerateResponse(
  responseId: string,
  options: RegenerateOptions = {}
): Promise<{ content: string }> {
  const supabase = createAdminClient();

  // Fetch existing response and review
  const { data: existing } = await supabase
    .from("responses")
    .select(
      "id, content, organization_id, review_id, reviews!inner(comment, star_rating, reviewer_name, sentiment, sentiment_themes)"
    )
    .eq("id", responseId)
    .single();

  if (!existing) throw new Error("Response not found");

  // Check budget
  const budgetCheck = await checkAIBudget(existing.organization_id);
  if (!budgetCheck.allowed) throw new Error(budgetCheck.reason);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const review = (existing as any).reviews;

  // Build modification instructions
  const modifications: string[] = [];
  if (options.adjustTone) {
    modifications.push(`Adjust the tone to be ${options.adjustTone}`);
  }
  if (options.shorterOrLonger === "shorter") {
    modifications.push("Make the response significantly shorter and more concise");
  } else if (options.shorterOrLonger === "longer") {
    modifications.push("Expand the response with more detail and warmth");
  }
  if (options.additionalInstructions) {
    modifications.push(options.additionalInstructions);
  }

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: RESPONSE_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: "You are an expert at crafting professional responses to Google reviews. Given an original review, an existing draft response, and modification instructions, write an improved response. Output ONLY the new response text. IMPORTANT: Respond in the same language as the review. If the review is in Spanish, respond in Spanish. If in English, respond in English.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `<review>
  <reviewer_name>${review.reviewer_name ?? "A customer"}</reviewer_name>
  <star_rating>${review.star_rating}/5</star_rating>
  <text>${review.comment ?? "(no text)"}</text>
</review>

<current_response>${existing.content}</current_response>

<modifications>
${modifications.map((m) => `- ${m}`).join("\n")}
</modifications>

Write an improved response incorporating these changes.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from regeneration");
  }

  const newContent = textBlock.text.trim();

  // Update the response record
  await supabase
    .from("responses")
    .update({
      content: newContent,
      ai_tokens_used:
        response.usage.input_tokens + response.usage.output_tokens,
      updated_at: new Date().toISOString(),
    })
    .eq("id", responseId);

  // Log usage
  await logAIUsage(
    existing.organization_id,
    RESPONSE_MODEL,
    response.usage.input_tokens,
    response.usage.output_tokens,
    "response_regeneration",
    existing.review_id
  );

  return { content: newContent };
}
