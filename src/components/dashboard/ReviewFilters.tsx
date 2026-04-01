"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

const starOptions = [1, 2, 3, 4, 5];
const sentimentOptions = ["positive", "neutral", "negative"] as const;
const statusOptions = ["responded", "unresponded"] as const;

export function ReviewFilters() {
  const t = useTranslations("dashboard.reviews");
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset cursor on filter change
      params.delete("cursor");
      router.push(`/dashboard/reviews?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key)?.split(",").filter(Boolean) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) {
        params.delete(key);
      } else {
        params.set(key, next.join(","));
      }
      params.delete("cursor");
      router.push(`/dashboard/reviews?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeStars =
    searchParams.get("stars")?.split(",").filter(Boolean) ?? [];
  const activeSentiment = searchParams.get("sentiment") ?? "";
  const activeStatus = searchParams.get("status") ?? "";

  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">{t("filters")}</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchReviews")}
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateParam("q", e.target.value || null)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
          />
        </div>

        {/* Star rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">{t("rating")}</span>
          {starOptions.map((star) => (
            <button
              key={star}
              onClick={() => toggleArrayParam("stars", String(star))}
              className={`flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                activeStars.includes(String(star))
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {star}
              <span className="text-amber-400">&#9733;</span>
            </button>
          ))}
        </div>

        {/* Sentiment */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">{t("sentiment")}</span>
          {sentimentOptions.map((s) => {
            const colors = {
              positive: "bg-green-100 text-green-700",
              neutral: "bg-amber-100 text-amber-700",
              negative: "bg-red-100 text-red-700",
            };
            return (
              <button
                key={s}
                onClick={() =>
                  updateParam("sentiment", activeSentiment === s ? null : s)
                }
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                  activeSentiment === s
                    ? colors[s]
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t(s)}
              </button>
            );
          })}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">{t("status")}</span>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() =>
                updateParam("status", activeStatus === s ? null : s)
              }
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                activeStatus === s
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
