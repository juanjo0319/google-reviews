import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentOrgData = await getCurrentOrg();
  const currentOrg = currentOrgData?.organization ?? null;

  if (!currentOrg) {
    redirect("/dashboard");
  }

  // Check if Google is already connected for this org
  const supabase = createAdminClient();
  const { data: googleToken } = await supabase
    .from("google_oauth_tokens")
    .select("id")
    .eq("organization_id", currentOrg.id)
    .limit(1)
    .single();

  const isGoogleConnected = !!googleToken;

  // Check if brand voice already exists
  const { data: brandVoice } = await supabase
    .from("brand_voice_configs")
    .select("id, tone, formality, use_emoji, signature_name")
    .eq("organization_id", currentOrg.id)
    .is("location_id", null)
    .single();

  return (
    <OnboardingWizard
      userName={session.user.name ?? ""}
      orgId={currentOrg.id}
      orgName={currentOrg.name}
      isGoogleConnected={isGoogleConnected}
      existingBrandVoice={
        brandVoice
          ? {
              tone: brandVoice.tone,
              formality: brandVoice.formality,
              useEmoji: brandVoice.use_emoji,
              signatureName: brandVoice.signature_name ?? "",
            }
          : null
      }
    />
  );
}
