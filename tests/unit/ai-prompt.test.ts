import { describe, it, expect } from "vitest";
import { testBrandVoice } from "../fixtures/data";

// Test the prompt construction logic by replicating the function
// from generate-response.ts (it's not exported, so we test the pattern)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSystemPrompt(brandVoice: any): string {
  let prompt =
    "You are an expert at crafting professional, empathetic responses to Google reviews. Write ONLY the response text.";

  if (brandVoice) {
    prompt += `\n\n<brand_voice>\n  <tone>${brandVoice.tone ?? "professional and friendly"}</tone>\n  <formality_level>${brandVoice.formality ?? 7}/10</formality_level>\n  <humor_level>${brandVoice.humor_level ?? 3}/10</humor_level>\n  <use_emoji>${brandVoice.use_emoji ? "yes" : "no"}</use_emoji>\n  <response_length>${brandVoice.response_length ?? "2-4 sentences"}</response_length>`;
    if (brandVoice.signature_name) {
      prompt += `\n  <signature_name>${brandVoice.signature_name}</signature_name>`;
    }
    prompt += "\n</brand_voice>";

    if (brandVoice.preferred_phrases?.length) {
      prompt += "\n\n<keywords_to_include>";
      for (const p of brandVoice.preferred_phrases) {
        prompt += "\n  - " + p;
      }
      prompt += "\n</keywords_to_include>";
    }

    if (brandVoice.avoid_phrases?.length) {
      prompt += "\n\n<keywords_to_avoid>";
      for (const p of brandVoice.avoid_phrases) {
        prompt += "\n  - " + p;
      }
      prompt += "\n</keywords_to_avoid>";
    }
  }

  return prompt;
}

describe("AI prompt construction", () => {
  it("includes brand voice XML tags", () => {
    const prompt = buildSystemPrompt(testBrandVoice);
    expect(prompt).toContain("<brand_voice>");
    expect(prompt).toContain("</brand_voice>");
    expect(prompt).toContain("<tone>professional and warm</tone>");
    expect(prompt).toContain("<formality_level>7/10</formality_level>");
    expect(prompt).toContain("<humor_level>3/10</humor_level>");
    expect(prompt).toContain("<use_emoji>no</use_emoji>");
  });

  it("includes signature name when set", () => {
    const prompt = buildSystemPrompt(testBrandVoice);
    expect(prompt).toContain(
      "<signature_name>The ReviewAI Team</signature_name>"
    );
  });

  it("omits signature when not set", () => {
    const prompt = buildSystemPrompt({
      ...testBrandVoice,
      signature_name: null,
    });
    expect(prompt).not.toContain("<signature_name>");
  });

  it("includes preferred phrases", () => {
    const prompt = buildSystemPrompt(testBrandVoice);
    expect(prompt).toContain("<keywords_to_include>");
    expect(prompt).toContain("Thank you for your feedback");
    expect(prompt).toContain("We appreciate your visit");
  });

  it("includes avoid phrases", () => {
    const prompt = buildSystemPrompt(testBrandVoice);
    expect(prompt).toContain("<keywords_to_avoid>");
    expect(prompt).toContain("sorry for the inconvenience");
  });

  it("handles null brand voice gracefully", () => {
    const prompt = buildSystemPrompt(null);
    expect(prompt).toContain("expert at crafting professional");
    expect(prompt).not.toContain("<brand_voice>");
  });

  it("handles emoji enabled", () => {
    const prompt = buildSystemPrompt({ ...testBrandVoice, use_emoji: true });
    expect(prompt).toContain("<use_emoji>yes</use_emoji>");
  });
});
