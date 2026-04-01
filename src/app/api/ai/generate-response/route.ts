import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAIBudget, logAIUsage } from "@/lib/ai/usage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const reviewId: string | undefined = body.reviewId;
  const adjustTone: string | undefined = body.adjustTone;
  const shorterOrLonger: string | undefined = body.shorterOrLonger;
  const additionalInstructions: string | undefined =
    body.additionalInstructions;

  if (!reviewId) {
    return NextResponse.json(
      { error: "reviewId is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Fetch review
  const { data: review } = await supabase
    .from("reviews")
    .select(
      "id, comment, star_rating, sentiment, sentiment_themes, reviewer_name, organization_id, location_id"
    )
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Verify user has access to this organization
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", review.organization_id)
    .eq("user_id", session.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Check AI budget
  const budgetCheck = await checkAIBudget(review.organization_id);
  if (!budgetCheck.allowed) {
    return NextResponse.json(
      { error: budgetCheck.reason },
      { status: 429 }
    );
  }

  // Fetch brand voice config
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

  // Build system prompt
  let systemPrompt =
    "You are an expert at crafting professional, empathetic responses to Google reviews. Write ONLY the response text.";

  if (brandVoice) {
    const bvParts = [
      "tone=" + String(brandVoice.tone),
      "formality=" + String(brandVoice.formality) + "/10",
      "humor=" + String(brandVoice.humor_level) + "/10",
      "emoji=" + (brandVoice.use_emoji ? "yes" : "no"),
      "length=" + String(brandVoice.response_length),
    ];
    systemPrompt += "\n\nBrand voice: " + bvParts.join(", ") + ".";
    if (brandVoice.signature_name) {
      systemPrompt += " Sign as: " + String(brandVoice.signature_name);
    }
  }

  // Build user prompt
  const reviewerName = review.reviewer_name ?? "a customer";
  const stars = String(review.star_rating);
  const sentimentStr = review.sentiment ?? "unknown";
  const commentStr = review.comment ?? "(no text)";

  let userPrompt =
    "Review from " +
    reviewerName +
    " (" +
    stars +
    '/5 stars, sentiment: ' +
    sentimentStr +
    '):\n\n"' +
    commentStr +
    '"';

  if (adjustTone || shorterOrLonger || additionalInstructions) {
    const mods: string[] = [];
    if (adjustTone) mods.push("Tone: " + adjustTone);
    if (shorterOrLonger) mods.push("Length: " + shorterOrLonger);
    if (additionalInstructions) mods.push(additionalInstructions);
    userPrompt += "\n\nModifications: " + mods.join(". ");
  }

  userPrompt += "\n\nWrite a response:";

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 1024,
    async onFinish({ usage }) {
      await logAIUsage(
        review.organization_id,
        "claude-sonnet-4-6",
        usage.inputTokens ?? 0,
        usage.outputTokens ?? 0,
        "response_generation_stream",
        reviewId
      );
    },
  });

  return result.toTextStreamResponse();
}
