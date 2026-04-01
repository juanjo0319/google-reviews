"use client";

import { useState, useTransition } from "react";

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
    title: "New Review Email",
    description: "Receive an email when a new review is posted",
  },
  {
    key: "newReviewInApp",
    title: "New Review In-App",
    description: "Show an in-app notification for new reviews",
  },
  {
    key: "weeklyDigest",
    title: "Weekly Digest",
    description: "Receive a weekly summary of review activity",
  },
  {
    key: "negativeReviewAlert",
    title: "Negative Review Alerts",
    description:
      "Get immediate alerts for reviews with 1-2 stars",
  },
] as const;

type NotifKey = (typeof notificationSettings)[number]["key"];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    newReviewEmail: true,
    newReviewInApp: true,
    weeklyDigest: true,
    negativeReviewAlert: true,
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleToggle(key: NotifKey, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      // TODO: Wire to Server Action
      console.log("Saving notification prefs:", prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
