import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reply, Inbox } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600" },
  pending_approval: { label: "Pending Approval", bg: "bg-amber-100", text: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-blue-100", text: "text-blue-700" },
  published: { label: "Published", bg: "bg-green-100", text: "text-green-700" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
};

const statusOrder = ["pending_approval", "draft", "approved", "published", "rejected"];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ResponsesPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();

  const { data: responses } = await supabase
    .from("responses")
    .select("id, review_id, content, status, is_ai_generated, created_at, reviews(id, reviewer_name, comment, star_rating)")
    .eq("organization_id", orgData.orgId)
    .order("created_at", { ascending: false })
    .limit(200);

  const allResponses = responses ?? [];

  // Group by status
  const grouped = statusOrder.reduce<Record<string, typeof allResponses>>((acc, status) => {
    acc[status] = allResponses.filter((r) => r.status === status);
    return acc;
  }, {});

  const hasAny = allResponses.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Responses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage all review responses across your organization
        </p>
      </div>

      {!hasAny ? (
        <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
          <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No responses yet
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Generate AI responses or write your own from the Reviews page.
          </p>
          <Link
            href="/dashboard/reviews"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Reply className="h-4 w-4" />
            Go to Reviews
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {statusOrder.map((status) => {
            const items = grouped[status];
            if (!items || items.length === 0) return null;
            const config = statusConfig[status];

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {config.label}
                  </h2>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((resp) => {
                    const review = resp.reviews as unknown as {
                      id: string;
                      reviewer_name: string | null;
                      comment: string | null;
                      star_rating: number;
                    } | null;

                    return (
                      <div
                        key={resp.id}
                        className="rounded-2xl bg-white border border-slate-100 p-5 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Review snippet */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-slate-900">
                                {review?.reviewer_name ?? "Anonymous"}
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < (review?.star_rating ?? 0)
                                        ? "text-amber-400"
                                        : "text-slate-200"
                                    }`}
                                  >
                                    &#9733;
                                  </span>
                                ))}
                              </div>
                              {resp.is_ai_generated && (
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                  AI
                                </span>
                              )}
                            </div>

                            {/* Review comment */}
                            {review?.comment && (
                              <p className="text-xs text-slate-400 mb-2 truncate">
                                Review: {review.comment}
                              </p>
                            )}

                            {/* Response content */}
                            <p className="text-sm text-slate-700 line-clamp-2">
                              {resp.content}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDate(resp.created_at)}
                            </span>
                          </div>
                        </div>

                        {review && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <Link
                              href={`/dashboard/reviews/${review.id}`}
                              className="text-xs font-medium text-primary hover:text-primary-dark"
                            >
                              View review details
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
