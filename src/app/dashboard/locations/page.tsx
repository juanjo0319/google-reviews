import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, CheckCircle, XCircle, Plus } from "lucide-react";
import Link from "next/link";

function formatDate(date: string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function LocationsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();

  // Fetch locations
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, address, is_verified, last_synced_at, created_at")
    .eq("organization_id", orgData.orgId)
    .order("created_at", { ascending: true });

  // Fetch review counts per location
  const locationIds = (locations ?? []).map((l) => l.id);
  let reviewCounts: Record<string, number> = {};

  if (locationIds.length > 0) {
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("location_id")
      .eq("organization_id", orgData.orgId)
      .in("location_id", locationIds);

    for (const r of reviewData ?? []) {
      reviewCounts[r.location_id] = (reviewCounts[r.location_id] || 0) + 1;
    }
  }

  const locs = locations ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your Google Business Profile locations
          </p>
        </div>
        <Link
          href="/dashboard/settings/locations"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </Link>
      </div>

      {locs.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No locations yet
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Connect your Google Business Profile to add your locations.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locs.map((loc) => (
            <div
              key={loc.id}
              className="rounded-2xl bg-white border border-slate-100 p-6 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {loc.name}
                    </h3>
                    {loc.address && (
                      <p className="text-xs text-slate-500 mt-0.5">{loc.address}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="flex items-center gap-1">
                    {loc.is_verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-700 font-medium">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Unverified</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Reviews</span>
                  <span className="font-medium text-slate-900">
                    {reviewCounts[loc.id] ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Last Synced</span>
                  <span className="text-slate-700 text-xs">
                    {formatDate(loc.last_synced_at)}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/settings/locations"
                className="block w-full text-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
