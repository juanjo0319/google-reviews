"use client";

import { useTransition } from "react";
import {
  Bell,
  Star,
  CheckCircle2,
  Send,
  UserPlus,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
  data: Record<string, unknown> | null;
}

const typeIcons: Record<string, typeof Bell> = {
  new_review: Star,
  negative_review: AlertTriangle,
  urgent_review: AlertTriangle,
  response_approved: CheckCircle2,
  response_published: Send,
  team_member_joined: UserPlus,
};

const typeColors: Record<string, string> = {
  new_review: "bg-primary/10 text-primary",
  negative_review: "bg-red-100 text-red-600",
  urgent_review: "bg-red-100 text-red-600",
  response_approved: "bg-green-100 text-green-600",
  response_published: "bg-green-100 text-green-600",
  team_member_joined: "bg-purple-100 text-purple-600",
};

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function markAsRead(id: string) {
    startTransition(async () => {
      const supabase = getSupabaseClient();
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      router.refresh();
    });
  }

  function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    startTransition(async () => {
      const supabase = getSupabaseClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
      router.refresh();
    });
  }

  function getLink(notif: Notification): string {
    if (notif.data?.reviewId) {
      return "/dashboard/reviews/" + notif.data.reviewId;
    }
    return "#";
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
        <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          No notifications
        </h3>
        <p className="text-sm text-slate-500">
          You&apos;ll see new review alerts and updates here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </span>
          <button
            onClick={markAllAsRead}
            disabled={isPending}
            className="text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-100 divide-y divide-slate-100">
        {notifications.map((notif) => {
          const Icon = typeIcons[notif.type ?? ""] ?? Bell;
          const colorClass =
            typeColors[notif.type ?? ""] ?? "bg-slate-100 text-slate-500";
          const link = getLink(notif);

          return (
            <div
              key={notif.id}
              className={
                "flex items-start gap-3 px-5 py-4 " +
                (!notif.read ? "bg-primary/5" : "")
              }
            >
              <div
                className={
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                  colorClass
                }
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {notif.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {notif.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDate(notif.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    disabled={isPending}
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Mark read
                  </button>
                )}
                {link !== "#" && (
                  <Link
                    href={link}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
