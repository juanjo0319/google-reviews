import { getAnthropicClient } from "./client";
import { logAIUsage, checkAIBudget } from "./usage";
import { createAdminClient } from "@/lib/supabase/admin";

const RESPONSE_MODEL = "claude-sonnet-4-6";

/**
 * Generate an AI response to a review using Claude Sonnet 4.6.
 * Considers brand voice configuration and review sentiment.
 */
export async function generateReviewResponse(
  reviewId: string,
  options?: { createdByUserId?: string }
): Promise<{ responseId: string; content: string }> {
  const supabase = createAdminClient();

  // Fetch review with sentiment analysis
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select(
      "id, comment, star_rating, sentiment, sentiment_themes, ai_analysis, organization_id, location_id, reviewer_name"
    )
    .eq("id", reviewId)
    .single();

  if (reviewError || !review) {
    throw new Error(`Review ${reviewId} not found`);
  }

  // Check AI budget
  const budgetCheck = await checkAIBudget(review.organization_id);
  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.reason);
  }

  // Fetch brand voice config (location-specific first, then org default)
  let brandVoice = null;
  if (review.location_id) {
    const { data } = await supabase
      .from("brand_voice_configs")
      .select("*")
      .eq("organization_id", review.organization_id)
      .eq("location_id", review.location_id)
      .single();
    brandVoice = data;
  }

  if (!brandVoice) {
    const { data } = await supabase
      .from("brand_voice_configs")
      .select("*")
      .eq("organization_id", review.organization_id)
      .is("location_id", null)
      .single();
    brandVoice = data;
  }

  // Build the prompt
  const systemPrompt = buildSystemPrompt(brandVoice);
  const userPrompt = buildUserPrompt(review);

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: RESPONSE_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: userPrompt },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from response generation");
  }

  const generatedContent = textBlock.text.trim();

  // Create a response record
  const { data: responseRecord, error: insertError } = await supabase
    .from("responses")
    .insert({
      review_id: reviewId,
      organization_id: review.organization_id,
      content: generatedContent,
      status: "draft",
      is_ai_generated: true,
      ai_model: RESPONSE_MODEL,
      ai_tokens_used:
        response.usage.input_tokens + response.usage.output_tokens,
      created_by: options?.createdByUserId ?? null,
    })
    .select("id")
    .single();

  if (insertError || !responseRecord) {
    throw new Error("Failed to save generated response");
  }

  // Log usage
  await logAIUsage(
    review.organization_id,
    RESPONSE_MODEL,
    response.usage.input_tokens,
    response.usage.output_tokens,
    "response_generation",
    reviewId
  );

  return { responseId: responseRecord.id, content: generatedContent };
}

// --- Prompt construction ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSystemPrompt(brandVoice: any): string {
  let prompt = `You are an expert at crafting professional, empathetic responses to Google reviews on behalf of businesses. Write ONLY the response text — no explanations, preamble, or quotes around the response.`;

  if (brandVoice) {
    prompt += `

<brand_voice>
  <tone>${brandVoice.tone ?? "professional and friendly"}</tone>
  <formality_level>${brandVoice.formality ?? 7}/10</formality_level>
  <humor_level>${brandVoice.humor_level ?? 3}/10</humor_level>
  <use_emoji>${brandVoice.use_emoji ? "yes" : "no"}</use_emoji>
  <response_length>${brandVoice.response_length ?? "2-4 sentences"}</response_length>
  ${brandVoice.signature_name ? `<signature_name>${brandVoice.signature_name}</signature_name>` : ""}
</brand_voice>`;

    if (brandVoice.preferred_phrases?.length) {
      prompt += `

<keywords_to_include>
${brandVoice.preferred_phrases.map((p: string) => `  - ${p}`).join("\n")}
</keywords_to_include>`;
    }

    if (brandVoice.avoid_phrases?.length) {
      prompt += `

<keywords_to_avoid>
${brandVoice.avoid_phrases.map((p: string) => `  - ${p}`).join("\n")}
</keywords_to_avoid>`;
    }

    if (brandVoice.custom_examples) {
      const examples = Array.isArray(brandVoice.custom_examples)
        ? brandVoice.custom_examples
        : [];
      if (examples.length > 0) {
        prompt += `

<examples>
${examples.map((ex: { review: string; response: string }, i: number) => `  <example_${i + 1}>
    <review>${ex.review}</review>
    <response>${ex.response}</response>
  </example_${i + 1}>`).join("\n")}
</examples>`;
      }
    }
  }

  prompt += `

<response_guidelines>
  - For POSITIVE reviews (4-5 stars): Thank the reviewer sincerely, reference specific compliments, invite them back
  - For NEGATIVE reviews (1-2 stars): Express empathy, take ownership without being defensive, offer to resolve offline, provide contact info if appropriate
  - For NEUTRAL reviews (3 stars): Thank for feedback, acknowledge both positives and concerns, suggest improvements you're making
  - For SPAM: Keep brief and professional, don't engage with irrelevant content
  - Never fabricate facts or make promises you can't keep
  - Keep the response within the specified length
  - Match the formality and tone settings exactly
  - IMPORTANT: Respond in the same language as the review. If the review is in Spanish, respond in Spanish. If in English, respond in English. Match the language automatically.
</response_guidelines>`;

  return prompt;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUserPrompt(review: any): string {
  const sentiment = review.ai_analysis
    ? `Sentiment: ${review.sentiment} (themes: ${(review.sentiment_themes ?? []).join(", ")})`
    : "";

  return `<review>
  <reviewer_name>${review.reviewer_name ?? "A customer"}</reviewer_name>
  <star_rating>${review.star_rating}/5</star_rating>
  <text>${review.comment ?? "(no text)"}</text>
  ${sentiment ? `<analysis>${sentiment}</analysis>` : ""}
</review>

Write a response to this review.`;
}
