"use client";

import { useState, useTransition } from "react";
import { Mail, MoreVertical, Shield, UserPlus, Crown, X } from "lucide-react";
import { inviteMember, updateMemberRole, removeMember } from "@/app/actions/orgs/membership";
import { useRouter } from "next/navigation";

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  image?: string | null;
}

const roleConfig = {
  owner: {
    label: "Owner",
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    bg: "bg-primary/10",
    text: "text-primary",
    icon: Shield,
  },
  member: {
    label: "Member",
    bg: "bg-slate-100",
    text: "text-slate-600",
    icon: null,
  },
};

export function TeamClient({
  orgId,
  members: initialMembers,
}: {
  orgId: string;
  members: TeamMember[];
}) {
  const [members] = useState<TeamMember[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [invited, setInvited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await inviteMember(orgId, inviteEmail, inviteRole);
      if (result.success) {
        setInvited(true);
        setInviteEmail("");
        setTimeout(() => setInvited(false), 3000);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to invite member");
      }
    });
  }

  function handleRoleChange(userId: string, newRole: "admin" | "member") {
    setError(null);
    setShowMenu(null);
    startTransition(async () => {
      const result = await updateMemberRole(orgId, userId, newRole);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed to update role");
      }
    });
  }

  function handleRemove(userId: string) {
    setError(null);
    setShowMenu(null);
    startTransition(async () => {
      const result = await removeMember(orgId, userId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed to remove member");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Invite Team Member
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Add people to your organization
        </p>

        {invited && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Invitation sent successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex flex-wrap gap-3 max-w-2xl">
          <div className="relative flex-1 min-w-[240px]">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) =>
              setInviteRole(e.target.value as "admin" | "member")
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-white"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {isPending ? "Sending..." : "Invite"}
          </button>
        </form>
      </div>

      {/* Member list */}
      <div className="rounded-2xl bg-white border border-slate-100">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Team Members
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map((member) => {
            const role = roleConfig[member.role];
            const RoleIcon = role.icon;
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-6 py-4"
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {(member.name || member.email || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {member.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${role.bg} ${role.text}`}
                >
                  {RoleIcon && <RoleIcon className="h-3 w-3" />}
                  {role.label}
                </span>
                {member.role !== "owner" && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowMenu(
                          showMenu === member.id ? null : member.id
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {showMenu === member.id && (
                      <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-50">
                        <button
                          onClick={() =>
                            handleRoleChange(
                              member.userId,
                              member.role === "admin" ? "member" : "admin"
                            )
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Shield className="h-4 w-4" />
                          {member.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                        </button>
                        <button
                          onClick={() => handleRemove(member.userId)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Remove member
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
