import { Star, Inbox, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getRecentReviews } from "@/lib/services/reviews";

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-amber-100 text-amber-700",
  negative: "bg-red-100 text-red-700",
};

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={"h-3.5 w-3.5 " +
            (i < count
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200")}
        />
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

export async function RecentReviews({ orgId }: { orgId: string }) {
  const { reviews, responseMap } = await getRecentReviews(orgId, 5);

  if (!reviews.length) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
        <Inbox className="h-10 w-10 text-slate-200 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">No reviews yet</h3>
        <p className="text-sm text-slate-500">
          Connect your Google Business Profile to start syncing reviews.
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Go to Settings <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Reviews</h2>
        <Link
          href="/dashboard/reviews"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {reviews.map((review) => {
          const status = responseMap.get(review.id);
          const statusLabel = status
            ? status === "published" ? "responded" : "pending"
            : "unresponded";
          const statusColor = statusLabel === "responded"
            ? "bg-primary/10 text-primary"
            : statusLabel === "pending"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-600";

          return (
            <Link key={review.id} href={"/dashboard/reviews/" + review.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {(review.reviewer_name ?? "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    {review.reviewer_name ?? "Anonymous"}
                  </span>
                  <StarDisplay count={review.star_rating} />
                  <span className="text-xs text-slate-400 ml-auto shrink-0">
                    {formatTimeAgo(review.review_created_at ?? review.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">{review.comment ?? "(no text)"}</p>
                <div className="flex items-center gap-2 mt-2">
                  {review.sentiment && (
                    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + (sentimentColors[review.sentiment] ?? "bg-slate-100 text-slate-600")}>
                      {review.sentiment}
                    </span>
                  )}
                  <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + statusColor}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
