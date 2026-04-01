import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { LocationSelector } from "./location-selector";
import { createGBPClient, type GoogleLocation } from "@/lib/google/client";
import { MapPin, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface AccountWithLocations {
  accountId: string;
  accountName: string;
  locations: GoogleLocation[];
}

export default async function LocationsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-slate-700 font-medium">
          No organization found
        </p>
      </div>
    );
  }

  // Check if Google tokens exist for this org
  const supabase = createAdminClient();
  const { data: tokenRecord } = await supabase
    .from("google_oauth_tokens")
    .select("id")
    .eq("organization_id", orgData.orgId)
    .limit(1)
    .single();

  if (!tokenRecord) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center">
        <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">
          No Google account connected
        </p>
        <p className="text-xs text-slate-500 mb-4">
          Connect your Google Business Profile first
        </p>
        <a
          href="/api/google/connect"
          className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Connect Google Account
        </a>
      </div>
    );
  }

  // Fetch accounts and locations from Google
  let accountsWithLocations: AccountWithLocations[] = [];
  let fetchError: string | null = null;

  try {
    const gbp = await createGBPClient(orgData.orgId);
    const accounts = await gbp.listAccounts();

    accountsWithLocations = await Promise.all(
      accounts.map(async (account) => {
        const locations = await gbp.listLocations(account.name);
        return {
          accountId: account.name,
          accountName: account.accountName,
          locations,
        };
      })
    );
  } catch (err) {
    console.error("Error fetching Google locations:", err);
    fetchError =
      err instanceof Error ? err.message : "Failed to fetch locations";
  }

  // Get already-connected locations
  const { data: existingLocations } = await supabase
    .from("locations")
    .select("google_location_id")
    .eq("organization_id", orgData.orgId);

  const connectedIds = new Set(
    (existingLocations ?? []).map((l) => l.google_location_id)
  );

  if (fetchError) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">
          Failed to load locations
        </p>
        <p className="text-xs text-slate-500 mb-4">{fetchError}</p>
        <a
          href="/api/google/connect"
          className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Reconnect Google Account
        </a>
      </div>
    );
  }

  const allLocations = accountsWithLocations.flatMap((a) => a.locations);

  if (allLocations.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center">
        <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">
          No locations found
        </p>
        <p className="text-xs text-slate-500">
          Your Google account doesn&apos;t have any verified Business Profile
          locations.
        </p>
      </div>
    );
  }

  return (
    <LocationSelector
      accountsWithLocations={accountsWithLocations.map((a) => ({
        accountId: a.accountId,
        accountName: a.accountName,
        locations: a.locations.map((l) => ({
          name: l.name,
          title: l.title,
          address: formatAddress(l),
          placeId: l.metadata?.placeId ?? null,
          phone: l.phoneNumbers?.primaryPhone ?? null,
          isConnected: connectedIds.has(l.name),
        })),
      }))}
      orgId={orgData.orgId}
    />
  );
}

function formatAddress(location: GoogleLocation): string {
  const addr = location.storefrontAddress;
  if (!addr) return "";
  const parts = [
    ...(addr.addressLines ?? []),
    addr.locality,
    addr.administrativeArea,
    addr.postalCode,
  ].filter(Boolean);
  return parts.join(", ");
}
