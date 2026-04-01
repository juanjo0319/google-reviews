"use client";

import { useState } from "react";
import { ReviewCard, type ReviewCardData } from "./ReviewCard";
import { BulkActionBar } from "./BulkActionBar";

interface ReviewListProps {
  reviews: ReviewCardData[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function handleSelectChange(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selected.size === reviews.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(reviews.map((r) => r.id)));
    }
  }

  const selectedIds = Array.from(selected);
  const unrespondedSelected = reviews.filter(
    (r) => selected.has(r.id) && r.responseStatus === "unresponded"
  ).length;

  return (
    <div className="space-y-4">
      {/* Select all / count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.size === reviews.length && reviews.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <span className="text-sm text-slate-500">
              {selected.size > 0
                ? selected.size + " of " + reviews.length + " selected"
                : reviews.length + " reviews"}
            </span>
          </label>
        </div>
      </div>

      {/* Review cards */}
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          selectable
          selected={selected.has(review.id)}
          onSelectChange={handleSelectChange}
        />
      ))}

      {/* Bulk action bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelected(new Set())}
        unrespondedCount={unrespondedSelected}
      />
    </div>
  );
}
