import { Suspense } from "react";
import { getCurrentOrg } from "@/lib/auth/permissions";
import { hasConnectedLocations } from "@/lib/services/organizations";
import { StatCards } from "./_components/stat-cards";
import { SentimentTrend } from "./_components/sentiment-trend";
import { RecentReviews } from "./_components/recent-reviews";
import { ActionRequired } from "./_components/action-required";
import { SetupPrompt } from "./_components/setup-prompt";
import { RatingGoalWrapper } from "./_components/rating-goal-wrapper";

// --- Skeleton loaders ---

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white p-4 border border-slate-100 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Page ---

export default async function DashboardPage() {
  const orgData = await getCurrentOrg();

  if (!orgData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your review performance</p>
        </div>
      </div>
    );
  }

  const orgId = orgData.orgId;
  const hasLocations = await hasConnectedLocations(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your review performance</p>
      </div>

      {!hasLocations ? (
        <Suspense>
          <SetupPrompt orgId={orgId} />
        </Suspense>
      ) : (
        <>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <StatCards orgId={orgId} />
          </Suspense>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Suspense fallback={<ReviewListSkeleton />}>
                <RecentReviews orgId={orgId} />
              </Suspense>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Suspense>
                <RatingGoalWrapper orgId={orgId} />
              </Suspense>
              <Suspense>
                <SentimentTrend orgId={orgId} />
              </Suspense>
              <Suspense fallback={<ReviewListSkeleton />}>
                <ActionRequired orgId={orgId} />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
