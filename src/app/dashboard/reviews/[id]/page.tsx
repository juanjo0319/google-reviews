import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/auth/permissions";
import { auth } from "@/lib/auth";
import { ReviewDetail } from "./review-detail";

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user) notFound();

  const orgData = await getCurrentOrg();
  if (!orgData) notFound();

  const supabase = createAdminClient();

  // Fetch review
  const { data: review } = await supabase
    .from("reviews")
    .select(
      "*, locations(name)"
    )
    .eq("id", id)
    .eq("organization_id", orgData.orgId)
    .single();

  if (!review) notFound();

  // Fetch all responses for this review
  const { data: responses } = await supabase
    .from("responses")
    .select("*, users:created_by(name, email), approver:approved_by(name)")
    .eq("review_id", id)
    .order("created_at", { ascending: false });

  // Fetch audit log entries for this review's responses
  const responseIds = (responses ?? []).map((r) => r.id);
  let auditEntries: {
    id: string;
    action: string;
    created_at: string;
    user_id: string | null;
    metadata: Record<string, unknown> | null;
    users: { name: string | null } | null;
  }[] = [];

  if (responseIds.length > 0) {
    const { data: audit } = await supabase
      .from("audit_log")
      .select("id, action, created_at, user_id, metadata, users:user_id(name)")
      .eq("entity_type", "response")
      .in("entity_id", responseIds)
      .order("created_at", { ascending: true });
    auditEntries = (audit ?? []) as typeof auditEntries;
  }

  // Determine user role
  const userRole = orgData.role as "owner" | "admin" | "member";

  // Serialize for the client
  const locationName =
    (review.locations as unknown as { name: string } | null)?.name ?? null;

  return (
    <ReviewDetail
      review={{
        id: review.id,
        reviewerName: review.reviewer_name ?? "Anonymous",
        reviewerPhoto: review.reviewer_photo_url,
        starRating: review.star_rating,
        comment: review.comment ?? "",
        sentiment: (review.sentiment as "positive" | "neutral" | "negative") ?? null,
        sentimentScore: review.sentiment_score ? Number(review.sentiment_score) : null,
        sentimentThemes: review.sentiment_themes ?? [],
        requiresUrgentResponse: review.requires_urgent_response,
        isSpam: review.is_spam,
        reviewCreatedAt: review.review_created_at,
        locationName,
      }}
      responses={(responses ?? []).map((r) => ({
        id: r.id,
        content: r.content,
        status: r.status as "draft" | "pending_approval" | "approved" | "published" | "rejected",
        isAiGenerated: r.is_ai_generated,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        publishedAt: r.published_at,
        createdByName: (r.users as unknown as { name: string } | null)?.name ?? null,
        approverName: (r.approver as unknown as { name: string } | null)?.name ?? null,
      }))}
      auditLog={auditEntries.map((a) => ({
        id: a.id,
        action: a.action,
        createdAt: a.created_at,
        userName: (a.users as unknown as { name: string } | null)?.name ?? "System",
        metadata: a.metadata as Record<string, unknown> | null,
      }))}
      userRole={userRole}
      reviewId={review.id}
    />
  );
}
