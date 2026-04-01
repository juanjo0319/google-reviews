"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { OrgSwitcher } from "./OrgSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface Notification {
  id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
}

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  currentOrg: {
    id: string;
    name: string;
    slug: string;
  } | null;
  organizations: {
    orgId: string;
    role: string;
    organization: { id: string; name: string; slug: string; plan_tier: string };
  }[];
  notifications: Notification[];
  unreadCount: number;
}

export function DashboardHeader({
  user,
  currentOrg,
  organizations,
  notifications,
  unreadCount,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-slate-100 bg-white shrink-0">
      {/* Left: org switcher */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <OrgSwitcher currentOrg={currentOrg} organizations={organizations} />
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-2">
        <NotificationBell
          userId={user.id}
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
        />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors"
          >
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user.name ?? user.email}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
