import { Star, TrendingUp, AlertTriangle, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { getUrgentReviews } from "@/lib/services/reviews";

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

export async function ActionRequired({ orgId }: { orgId: string }) {
  const unrespondedUrgent = await getUrgentReviews(orgId);

  if (unrespondedUrgent.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 mx-auto mb-3">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-sm font-medium text-slate-700">All caught up!</p>
        <p className="text-xs text-slate-500 mt-1">No urgent reviews need attention.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100">
      <div className="flex items-center gap-2 p-6 pb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900">Action Required</h2>
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unrespondedUrgent.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {unrespondedUrgent.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-600">
              {(item.reviewer_name ?? "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">{item.reviewer_name ?? "Anonymous"}</span>
                <StarDisplay count={item.star_rating} />
                <span className="text-xs text-slate-400 ml-auto shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(item.review_created_at ?? item.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-600 truncate">{item.comment ?? "(no text)"}</p>
              <Link
                href={"/dashboard/reviews/" + item.id}
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-dark"
              >
                Respond now <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
