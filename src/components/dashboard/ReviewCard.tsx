"use client";

import { Star, Reply } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const sentimentConfig = {
  positive: { bg: "bg-green-100", text: "text-green-700", label: "Positive" },
  neutral: { bg: "bg-amber-100", text: "text-amber-700", label: "Neutral" },
  negative: { bg: "bg-red-100", text: "text-red-700", label: "Negative" },
} as const;

const statusConfig = {
  responded: { bg: "bg-primary/10", text: "text-primary", label: "Responded" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  unresponded: { bg: "bg-slate-100", text: "text-slate-600", label: "Unresponded" },
} as const;

export interface ReviewCardData {
  id: string;
  reviewerName: string;
  reviewerPhoto?: string | null;
  starRating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  responseStatus: "responded" | "pending" | "unresponded";
  createdAt: string;
  locationName?: string;
}

interface ReviewCardProps {
  review: ReviewCardData;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
}

export function ReviewCard({
  review,
  selectable,
  selected,
  onSelectChange,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sentiment = sentimentConfig[review.sentiment];
  const status = statusConfig[review.responseStatus];
  const isLong = review.comment.length > 180;

  return (
    <div className={
      "rounded-2xl bg-white p-5 border transition-colors " +
      (selected ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200")
    }>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectChange?.(review.id, e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 shrink-0 cursor-pointer"
          />
        )}

        {review.reviewerPhoto ? (
          <Image
            src={review.reviewerPhoto}
            alt={review.reviewerName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {review.reviewerName[0]}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">
              {review.reviewerName}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    "h-3.5 w-3.5 " +
                    (i < review.starRating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200")
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{review.createdAt}</span>
            {review.locationName && (
              <>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs text-slate-400">{review.locationName}</span>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
              sentiment.bg + " " + sentiment.text
            }
          >
            {sentiment.label}
          </span>
          <span
            className={
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
              status.bg + " " + status.text
            }
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Review text */}
      <div className={"mt-3" + (selectable ? " ml-7" : "")}>
        <p className="text-sm text-slate-700 leading-relaxed">
          &ldquo;
          {isLong && !expanded
            ? review.comment.slice(0, 180) + "..."
            : review.comment}
          &rdquo;
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-primary hover:text-primary-dark mt-1"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className={"flex items-center gap-2 mt-4 pt-3 border-t border-slate-100" + (selectable ? " ml-7" : "")}>
        <Link
          href={"/dashboard/reviews/" + review.id}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <Reply className="h-3.5 w-3.5" />
          Respond
        </Link>
      </div>
    </div>
  );
}
