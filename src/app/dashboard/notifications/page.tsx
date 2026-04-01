import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { NotificationList } from "./notification-list";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const t = await getTranslations("dashboard.notifications");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const supabase = createAdminClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, message, read, created_at, data")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <NotificationList
        notifications={(notifications ?? []).map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.created_at,
          data: n.data as Record<string, unknown> | null,
        }))}
      />
    </div>
  );
}
