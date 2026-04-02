import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentOrg, getUserOrganizations } from "@/lib/auth/permissions";
import { ensureOrganization } from "@/app/actions/organizations";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { checkOnboardingCompleted } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Ensure user has at least one organization
  await ensureOrganization();

  // Check if user has completed onboarding — redirect if not.
  // Skip this check when already on the onboarding page to avoid infinite redirects.
  // The proxy sets x-pathname on every request so server components can read the URL.
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isOnOnboarding = pathname.includes("/onboarding");

  if (!isOnOnboarding) {
    const onboardingDone = await checkOnboardingCompleted(session.user.id);
    if (!onboardingDone) {
      redirect("/dashboard/onboarding");
    }
  }

  const [currentOrgData, organizations] = await Promise.all([
    getCurrentOrg(),
    getUserOrganizations(),
  ]);

  const currentOrg = currentOrgData?.organization ?? null;

  // Fetch recent notifications for the bell
  const supabase = createAdminClient();
  const [{ data: recentNotifs }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, message, read, created_at, data")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("read", false),
  ]);

  const notifications = (recentNotifs ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    created_at: n.created_at,
    data: n.data as Record<string, unknown> | null,
  }));

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          user={session.user}
          currentOrg={currentOrg}
          organizations={organizations}
          notifications={notifications}
          unreadCount={unreadCount ?? 0}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
