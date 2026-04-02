import { TrendingUp, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getCurrentOrg } from "@/lib/auth/permissions";
import { hasConnectedLocations, hasGoogleTokens } from "@/lib/services/organizations";

export async function SetupPrompt() {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const hasLocations = await hasConnectedLocations(orgData.orgId);
  if (hasLocations) return null;

  const hasGoogleConnected = await hasGoogleTokens(orgData.orgId);

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 lg:p-12">
      <div className="max-w-lg mx-auto text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {hasGoogleConnected
            ? "Select your business locations"
            : "Connect your Google Business Profile"}
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {hasGoogleConnected
            ? "Your Google account is connected! Now select which locations you'd like to manage reviews for."
            : "Link your Google Business Profile to start syncing and responding to your reviews with AI. It only takes a minute."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasGoogleConnected ? (
            <Link
              href="/dashboard/settings/locations"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              <MapPin className="h-4 w-4" />
              Select Locations
            </Link>
          ) : (
            <a
              href="/api/google/connect"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity={0.7} />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" opacity={0.5} />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity={0.8} />
              </svg>
              Connect Google Business
            </a>
          )}
          <Link
            href="/dashboard/help"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Learn how it works
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-primary/10">
          {[
            { step: "1", label: "Connect Google", done: hasGoogleConnected },
            { step: "2", label: "Select locations", done: false },
            { step: "3", label: "AI handles reviews", done: false },
          ].map(({ step, label, done }) => (
            <div key={step} className="text-center">
              <div className={"flex h-8 w-8 items-center justify-center rounded-full mx-auto mb-2 text-sm font-bold " +
                (done ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                {done ? <TrendingUp className="h-4 w-4" /> : step}
              </div>
              <p className={"text-xs font-medium " + (done ? "text-green-600" : "text-slate-500")}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
