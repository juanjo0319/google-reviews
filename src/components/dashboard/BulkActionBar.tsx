"use client";

import { useTransition, useState } from "react";
import { Sparkles, CheckCheck, X, Loader2 } from "lucide-react";
import { bulkGenerateResponses, bulkMarkAsRead } from "@/app/actions/reviews";
import { useRouter } from "next/navigation";

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  unrespondedCount: number;
}

export function BulkActionBar({
  selectedIds,
  onClear,
  unrespondedCount,
}: BulkActionBarProps) {
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const router = useRouter();

  if (selectedIds.length === 0) return null;

  function handleBulkGenerate() {
    setProgress("Generating AI responses...");
    startTransition(async () => {
      const result = await bulkGenerateResponses(selectedIds);
      if (result.success) {
        setProgress(
          "Done! Generated " +
            (result.generated ?? 0) +
            " responses" +
            (result.failed ? ", " + result.failed + " failed" : "")
        );
        setTimeout(() => {
          setProgress(null);
          onClear();
          router.refresh();
        }, 2000);
      } else {
        setProgress("Error: " + (result.error ?? "Unknown"));
        setTimeout(() => setProgress(null), 3000);
      }
    });
  }

  function handleMarkAsRead() {
    startTransition(async () => {
      await bulkMarkAsRead(selectedIds);
      onClear();
      router.refresh();
    });
  }

  return (
    <div className="sticky bottom-4 z-30 mx-auto max-w-3xl">
      <div className="rounded-2xl bg-slate-900 px-5 py-3 shadow-xl flex items-center gap-3 text-white">
        {/* Count */}
        <span className="text-sm font-medium shrink-0">
          {selectedIds.length} selected
        </span>

        <div className="h-4 w-px bg-slate-700" />

        {/* Progress indicator */}
        {progress ? (
          <div className="flex items-center gap-2 flex-1 text-sm">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{progress}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            {/* Bulk generate */}
            {unrespondedCount > 0 && (
              <button
                onClick={handleBulkGenerate}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate AI Responses ({unrespondedCount})
              </button>
            )}

            {/* Mark as read */}
            <button
              onClick={handleMarkAsRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark as Read
            </button>
          </div>
        )}

        {/* Clear selection */}
        <button
          onClick={onClear}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
