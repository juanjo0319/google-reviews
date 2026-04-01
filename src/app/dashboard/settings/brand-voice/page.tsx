import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { BrandVoiceForm, type BrandVoiceData } from "./brand-voice-form";

export default async function BrandVoicePage() {
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();

  const { data: config } = await supabase
    .from("brand_voice_configs")
    .select("tone, formality, humor_level, use_emoji, signature_name, preferred_phrases, avoid_phrases, response_length, custom_examples, values")
    .eq("organization_id", orgData.orgId)
    .is("location_id", null)
    .single();

  const initialData: BrandVoiceData | null = config
    ? {
        tone: config.tone,
        formality: config.formality,
        humor_level: config.humor_level,
        use_emoji: config.use_emoji,
        signature_name: config.signature_name,
        preferred_phrases: config.preferred_phrases,
        avoid_phrases: config.avoid_phrases,
        response_length: config.response_length,
        custom_examples: config.custom_examples,
        values: config.values,
      }
    : null;

  return <BrandVoiceForm orgId={orgData.orgId} initialData={initialData} />;
}
