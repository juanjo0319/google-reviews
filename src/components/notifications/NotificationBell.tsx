"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
}

interface NotificationBellProps {
  userId: string;
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export function NotificationBell({
  userId,
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel("user-notifications-" + userId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "user_id=eq." + userId,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const supabase = getSupabaseClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    const supabase = getSupabaseClient();
    const unreadIds = notifications
      .filter((n) => !n.read)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  function getNotificationLink(notif: Notification): string {
    const data = notif.data;
    if (data?.reviewId) return "/dashboard/reviews/" + data.reviewId;
    return "/dashboard/notifications";
  }

  function formatTime(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    return days + "d ago";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-lg border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:text-primary-dark"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                View all
              </Link>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={getNotificationLink(notif)}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    setOpen(false);
                  }}
                  className={
                    "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors " +
                    (!notif.read ? "bg-primary/5" : "")
                  }
                >
                  <div
                    className={
                      "mt-1 h-2 w-2 shrink-0 rounded-full " +
                      (!notif.read ? "bg-primary" : "bg-transparent")
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatTime(notif.created_at)}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-1" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
