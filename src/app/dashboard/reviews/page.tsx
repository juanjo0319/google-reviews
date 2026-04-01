import { Suspense } from "react";
import { type ReviewCardData } from "@/components/dashboard/ReviewCard";
import { ReviewFilters } from "@/components/dashboard/ReviewFilters";
import { ReviewList } from "@/components/dashboard/ReviewList";
import { MessageSquare } from "lucide-react";

// Placeholder reviews — will be replaced with Supabase queries
const placeholderReviews: ReviewCardData[] = [
  {
    id: "1",
    reviewerName: "Sarah M.",
    starRating: 5,
    comment:
      "Absolutely fantastic experience! The staff went above and beyond to make our visit special. Every dish was perfectly prepared and the ambiance was wonderful. Will definitely be coming back!",
    sentiment: "positive",
    responseStatus: "responded",
    createdAt: "2 hours ago",
    locationName: "Downtown Location",
  },
  {
    id: "2",
    reviewerName: "James T.",
    starRating: 3,
    comment:
      "Decent food but the wait times are getting longer. Used to be much better about this.",
    sentiment: "neutral",
    responseStatus: "pending",
    createdAt: "5 hours ago",
    locationName: "Westside Branch",
  },
  {
    id: "3",
    reviewerName: "Emily R.",
    starRating: 1,
    comment:
      "Terrible service. Wrong order twice and no one seemed to care about fixing it. Very disappointing for a place with such high ratings.",
    sentiment: "negative",
    responseStatus: "unresponded",
    createdAt: "8 hours ago",
    locationName: "Downtown Location",
  },
  {
    id: "4",
    reviewerName: "Michael B.",
    starRating: 4,
    comment:
      "Great quality products. Delivery was a bit slow but everything arrived in perfect condition.",
    sentiment: "positive",
    responseStatus: "responded",
    createdAt: "1 day ago",
    locationName: "Online Store",
  },
  {
    id: "5",
    reviewerName: "Lisa K.",
    starRating: 5,
    comment:
      "Best experience I've had in years! Will definitely be coming back and recommending to all my friends.",
    sentiment: "positive",
    responseStatus: "responded",
    createdAt: "1 day ago",
    locationName: "Downtown Location",
  },
  {
    id: "6",
    reviewerName: "David P.",
    starRating: 2,
    comment:
      "Very disappointing. Quality has really gone downhill lately. The prices keep going up but the experience keeps getting worse.",
    sentiment: "negative",
    responseStatus: "unresponded",
    createdAt: "2 days ago",
    locationName: "Westside Branch",
  },
  {
    id: "7",
    reviewerName: "Anna W.",
    starRating: 4,
    comment: "Nice place, friendly staff. The desserts are outstanding.",
    sentiment: "positive",
    responseStatus: "responded",
    createdAt: "2 days ago",
    locationName: "Downtown Location",
  },
  {
    id: "8",
    reviewerName: "Robert H.",
    starRating: 3,
    comment:
      "Average experience overall. Nothing particularly bad but nothing stood out either.",
    sentiment: "neutral",
    responseStatus: "unresponded",
    createdAt: "3 days ago",
    locationName: "Westside Branch",
  },
];

function filterReviews(
  reviews: ReviewCardData[],
  searchParams: Record<string, string | undefined>
): ReviewCardData[] {
  let filtered = [...reviews];

  const stars = searchParams.stars?.split(",").filter(Boolean).map(Number);
  if (stars?.length) {
    filtered = filtered.filter((r) => stars.includes(r.starRating));
  }

  if (searchParams.sentiment) {
    filtered = filtered.filter((r) => r.sentiment === searchParams.sentiment);
  }

  if (searchParams.status) {
    filtered = filtered.filter((r) => r.responseStatus === searchParams.status);
  }

  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.comment.toLowerCase().includes(q) ||
        r.reviewerName.toLowerCase().includes(q)
    );
  }

  return filtered;
}

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

async function ReviewsListWithData({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const reviews = filterReviews(placeholderReviews, searchParams);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          No reviews found
        </h3>
        <p className="text-sm text-slate-500">
          Try adjusting your filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return <ReviewList reviews={reviews} />;
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
