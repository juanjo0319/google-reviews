import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { TeamClient, type TeamMember } from "./team-client";

export default async function TeamPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("id, user_id, role, users(id, name, email, image)")
    .eq("organization_id", orgData.orgId)
    .order("created_at", { ascending: true });

  const members: TeamMember[] = (memberships ?? []).map((m) => {
    const user = m.users as unknown as { id: string; name: string | null; email: string | null; image: string | null } | null;
    return {
      id: m.id,
      userId: m.user_id,
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: m.role as "owner" | "admin" | "member",
      image: user?.image ?? null,
    };
  });

  return <TeamClient orgId={orgData.orgId} members={members} />;
}
