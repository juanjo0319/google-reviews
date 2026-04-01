"use client";

import { useState, useTransition } from "react";
import { saveNotificationPreferences } from "@/app/actions/settings";

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const notificationSettings = [
  {
    key: "newReviewEmail",
    dbKey: "new_review_email",
    title: "New Review Email",
    description: "Receive an email when a new review is posted",
  },
  {
    key: "newReviewInApp",
    dbKey: "new_review_in_app",
    title: "New Review In-App",
    description: "Show an in-app notification for new reviews",
  },
  {
    key: "weeklyDigest",
    dbKey: "weekly_digest",
    title: "Weekly Digest",
    description: "Receive a weekly summary of review activity",
  },
  {
    key: "negativeReviewAlert",
    dbKey: "negative_review_alert",
    title: "Negative Review Alerts",
    description:
      "Get immediate alerts for reviews with 1-2 stars",
  },
] as const;

type NotifKey = (typeof notificationSettings)[number]["key"];

export interface NotificationPrefsData {
  new_review_email: boolean;
  new_review_in_app: boolean;
  weekly_digest: boolean;
  negative_review_alert: boolean;
}

export function NotificationsForm({
  orgId,
  initialData,
}: {
  orgId: string;
  initialData: NotificationPrefsData | null;
}) {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    newReviewEmail: initialData?.new_review_email ?? true,
    newReviewInApp: initialData?.new_review_in_app ?? true,
    weeklyDigest: initialData?.weekly_digest ?? true,
    negativeReviewAlert: initialData?.negative_review_alert ?? true,
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggle(key: NotifKey, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveNotificationPreferences(orgId, {
        new_review_email: prefs.newReviewEmail,
        new_review_in_app: prefs.newReviewInApp,
        weekly_digest: prefs.weeklyDigest,
        negative_review_alert: prefs.negativeReviewAlert,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Notification Preferences
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose how you want to be notified about review activity
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="divide-y divide-slate-100 max-w-2xl">
          {notificationSettings.map(({ key, title, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
              <Toggle
                enabled={prefs[key]}
                onChange={(v) => handleToggle(key, v)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending
              ? "Saving..."
              : saved
              ? "Saved!"
              : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
