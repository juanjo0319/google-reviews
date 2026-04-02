import { Suspense } from "react";
import { type ReviewCardData } from "@/components/dashboard/ReviewCard";
import { ReviewFilters } from "@/components/dashboard/ReviewFilters";
import { ReviewList } from "@/components/dashboard/ReviewList";
import { MessageSquare, ArrowUpRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/auth/permissions";
import Link from "next/link";

function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-5 border border-slate-100 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

async function ReviewsListWithData({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const supabase = createAdminClient();

  // Build query — include response status via Supabase relation join
  let query = supabase
    .from("reviews")
    .select("id, reviewer_name, reviewer_photo_url, star_rating, comment, sentiment, review_created_at, created_at, locations(name), responses(status)")
    .eq("organization_id", orgData.orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Apply filters
  if (searchParams.stars) {
    const stars = searchParams.stars.split(",").filter(Boolean).map(Number);
    if (stars.length > 0) {
      query = query.in("star_rating", stars);
    }
  }

  if (searchParams.sentiment) {
    query = query.eq("sentiment", searchParams.sentiment);
  }

  if (searchParams.q) {
    query = query.or(
      "comment.ilike.%" + searchParams.q + "%,reviewer_name.ilike.%" + searchParams.q + "%"
    );
  }

  const { data: reviews } = await query;

  if (!reviews?.length) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          No reviews found
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {searchParams.stars || searchParams.sentiment || searchParams.q
            ? "Try adjusting your filters."
            : "Connect your Google Business Profile to start syncing reviews."}
        </p>
        {!searchParams.stars && !searchParams.sentiment && !searchParams.q && (
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Go to Settings <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    );
  }

  // Map to ReviewCardData — response status comes from the joined responses relation
  const cardData: ReviewCardData[] = reviews.map((r) => {
    const responses = (r.responses ?? []) as unknown as { status: string }[];
    const latestStatus = responses[0]?.status;
    const responseStatus: "responded" | "pending" | "unresponded" = latestStatus
      ? latestStatus === "published" ? "responded" : "pending"
      : "unresponded";

    return {
      id: r.id,
      reviewerName: r.reviewer_name ?? "Anonymous",
      reviewerPhoto: r.reviewer_photo_url,
      starRating: r.star_rating,
      comment: r.comment ?? "(no text)",
      sentiment: (r.sentiment as "positive" | "neutral" | "negative") ?? "neutral",
      responseStatus,
      createdAt: formatTimeAgo(r.review_created_at ?? r.created_at),
      locationName: (r.locations as unknown as { name: string } | null)?.name ?? undefined,
    };
  });

  // Apply status filter
  let filtered = cardData;
  if (searchParams.status === "responded") {
    filtered = filtered.filter((r) => r.responseStatus === "responded");
  } else if (searchParams.status === "unresponded") {
    filtered = filtered.filter((r) => r.responseStatus === "unresponded");
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No reviews found</h3>
        <p className="text-sm text-slate-500">Try adjusting your filters.</p>
      </div>
    );
  }

  return <ReviewList reviews={filtered} />;
}

export default async function ReviewsPage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and respond to all your Google reviews
        </p>
      </div>

      <Suspense>
        <ReviewFilters />
      </Suspense>

      <Suspense fallback={<ReviewListSkeleton />}>
        <ReviewsListWithData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
