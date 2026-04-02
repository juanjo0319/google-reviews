import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Check if a user has completed onboarding.
 */
export async function checkOnboardingCompleted(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();

  return data?.onboarding_completed === true;
}
