"use client";

import { useState, useTransition } from "react";
import { MapPin, Check, Loader2 } from "lucide-react";
import { connectLocations } from "@/app/actions/locations";
import { useRouter } from "next/navigation";

interface LocationInfo {
  name: string;
  title: string;
  address: string;
  placeId: string | null;
  phone: string | null;
  isConnected: boolean;
}

interface AccountGroup {
  accountId: string;
  accountName: string;
  locations: LocationInfo[];
}

export function LocationSelector({
  accountsWithLocations,
  orgId,
}: {
  accountsWithLocations: AccountGroup[];
  orgId: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  function toggleLocation(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleConnect() {
    const locations = accountsWithLocations.flatMap((a) =>
      a.locations
        .filter((l) => selected.has(l.name))
        .map((l) => ({
          googleAccountId: a.accountId,
          googleLocationId: l.name,
          name: l.title,
          address: l.address,
          phone: l.phone,
          googlePlaceId: l.placeId,
        }))
    );

    startTransition(async () => {
      const result = await connectLocations(orgId, locations);
      if (result.success) {
        setMessage({
          type: "success",
          text: `${locations.length} location(s) connected! Syncing reviews...`,
        });
        setSelected(new Set());
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to connect" });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Select Locations to Manage
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose which Google Business Profile locations you want to manage
          reviews for
        </p>

        {message && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {accountsWithLocations.map((account) => (
          <div key={account.accountId} className="mb-6 last:mb-0">
            {accountsWithLocations.length > 1 && (
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                {account.accountName}
              </p>
            )}
            <div className="space-y-2">
              {account.locations.map((location) => {
                const isSelected = selected.has(location.name);
                return (
                  <button
                    key={location.name}
                    disabled={location.isConnected}
                    onClick={() => toggleLocation(location.name)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      location.isConnected
                        ? "border-green-200 bg-green-50 cursor-default"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        location.isConnected
                          ? "bg-green-100 text-green-600"
                          : isSelected
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {location.isConnected ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {location.title}
                      </p>
                      {location.address && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {location.address}
                        </p>
                      )}
                      {location.phone && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {location.phone}
                        </p>
                      )}
                    </div>
                    {location.isConnected && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Connected
                      </span>
                    )}
                    {isSelected && !location.isConnected && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {selected.size > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {selected.size} location{selected.size !== 1 ? "s" : ""} selected
            </p>
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Connecting..." : "Connect Selected Locations"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
