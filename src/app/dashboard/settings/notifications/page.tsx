import { getCurrentOrg } from "@/lib/auth/permissions";
import { requireAuth } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationsForm, type NotificationPrefsData } from "./notifications-form";

export default async function NotificationsPage() {
  const session = await requireAuth();
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("new_review_email, new_review_in_app, weekly_digest, negative_review_alert")
    .eq("organization_id", orgData.orgId)
    .eq("user_id", session.user.id)
    .single();

  const initialData: NotificationPrefsData | null = prefs
    ? {
        new_review_email: prefs.new_review_email,
        new_review_in_app: prefs.new_review_in_app,
        weekly_digest: prefs.weekly_digest,
        negative_review_alert: prefs.negative_review_alert,
      }
    : null;

  return <NotificationsForm orgId={orgData.orgId} initialData={initialData} />;
}
