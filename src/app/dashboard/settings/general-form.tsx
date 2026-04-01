"use client";

import { useState, useTransition } from "react";
import { Building2, Globe, Link2 } from "lucide-react";
import { updateOrganization } from "@/app/actions/settings";

export function GeneralSettingsForm({
  orgId,
  name,
  slug,
}: {
  orgId: string;
  name: string;
  slug: string;
}) {
  const [orgName, setOrgName] = useState(name);
  const [orgSlug, setOrgSlug] = useState(slug);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateOrganization(orgId, orgName, orgSlug);
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
      {/* Organization details */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Organization Details
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Basic information about your organization
        </p>

        <div className="space-y-4 max-w-lg">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Organization Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Slug
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              reviewai.app/org/{orgSlug}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Connected Google Accounts
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Google Business Profile accounts linked to this organization
        </p>

        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <Globe className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 mb-1">
            No accounts connected
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Connect your Google Business Profile to start syncing reviews
          </p>
          <a
            href="/api/google/connect"
            className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Connect Google Account
          </a>
        </div>
      </div>
    </div>
  );
}
