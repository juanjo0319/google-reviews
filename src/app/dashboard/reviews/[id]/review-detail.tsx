"use client";

import { useState } from "react";
import {
  Star,
  ArrowLeft,
  AlertTriangle,
  Shield,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ResponseEditor } from "./response-editor";

// --- Types ---

interface ReviewData {
  id: string;
  reviewerName: string;
  reviewerPhoto: string | null;
  starRating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative" | null;
  sentimentScore: number | null;
  sentimentThemes: string[];
  requiresUrgentResponse: boolean;
  isSpam: boolean;
  reviewCreatedAt: string | null;
  locationName: string | null;
}

interface ResponseData {
  id: string;
  content: string;
  status: "draft" | "pending_approval" | "approved" | "published" | "rejected";
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdByName: string | null;
  approverName: string | null;
}

interface AuditEntry {
  id: string;
  action: string;
  createdAt: string;
  userName: string;
  metadata: Record<string, unknown> | null;
}

interface Props {
  review: ReviewData;
  responses: ResponseData[];
  auditLog: AuditEntry[];
  userRole: "owner" | "admin" | "member";
  reviewId: string;
}

// --- Helpers ---

const sentimentColors = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-amber-100 text-amber-700",
  negative: "bg-red-100 text-red-700",
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const actionLabels: Record<string, string> = {
  "response.submitted_for_approval": "Submitted for approval",
  "response.approved": "Approved",
  "response.rejected": "Rejected",
  "response.published": "Published to Google",
  "response.publish_failed": "Publish failed",
  "response.discarded": "Discarded",
  "response.deleted_from_google": "Deleted from Google",
};

// --- Component ---

export function ReviewDetail({ review, responses, auditLog, userRole, reviewId }: Props) {
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/reviews"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Review Detail</h1>
          <p className="text-sm text-slate-500">
            {review.reviewerName} {review.locationName ? " — " + review.locationName : ""}
          </p>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Review */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 p-6">
            {/* Reviewer info */}
            <div className="flex items-start gap-3 mb-4">
              {review.reviewerPhoto ? (
                <Image src={review.reviewerPhoto} alt={review.reviewerName} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                  {review.reviewerName[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{review.reviewerName}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={"h-4 w-4 " + (i < review.starRating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">{formatDate(review.reviewCreatedAt)}</p>
              </div>
            </div>

            {/* Full review text */}
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {review.comment || "(No text provided)"}
            </p>

            {/* Flags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {review.requiresUrgentResponse && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                  <AlertTriangle className="h-3 w-3" /> Urgent
                </span>
              )}
              {review.isSpam && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <Shield className="h-3 w-3" /> Spam
                </span>
              )}
            </div>
          </div>

          {/* Sentiment analysis */}
          {review.sentiment && (
            <div className="rounded-2xl bg-white border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Sentiment Analysis</h3>
              <div className="flex items-center gap-3 mb-3">
                <span className={"inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize " + sentimentColors[review.sentiment]}>
                  {review.sentiment}
                </span>
                {review.sentimentScore != null && (
                  <span className="text-sm text-slate-500">
                    Confidence: {Math.round(review.sentimentScore * 100)}%
                  </span>
                )}
              </div>
              {review.sentimentThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {review.sentimentThemes.map((theme) => (
                    <span key={theme} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Response history timeline */}
          {auditLog.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Activity Timeline</h3>
              <div className="space-y-3">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <FileText className="h-3 w-3 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{entry.userName}</span>{" "}
                        {actionLabels[entry.action] ?? entry.action}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                      {entry.metadata && "note" in entry.metadata && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          &ldquo;{String(entry.metadata.note)}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Response editor (extracted component) */}
        <ResponseEditor
          reviewId={reviewId}
          responses={responses}
          userRole={userRole}
          actionError={actionError}
          setActionError={setActionError}
        />
      </div>
    </div>
  );
}
