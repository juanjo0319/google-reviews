"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Sparkles, Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";

type ReviewTab = "5-star" | "3-star" | "1-star";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < count ? "fill-warning text-warning" : "text-neutral-200"
          )}
        />
      ))}
    </div>
  );
}

export function InteractiveDemo() {
  const t = useTranslations("marketing.interactiveDemo");

  const REVIEWS: Record<
    ReviewTab,
    {
      name: string;
      initials: string;
      stars: number;
      text: string;
      response: string;
      sentiment: string;
      sentimentColor: "success" | "warning" | "danger";
    }
  > = {
    "5-star": {
      name: "Sarah Mitchell",
      initials: "SM",
      stars: 5,
      text: t("review5Star"),
      response: t("response5Star"),
      sentiment: t("sentiment5Star"),
      sentimentColor: "success",
    },
    "3-star": {
      name: "James Wilson",
      initials: "JW",
      stars: 3,
      text: t("review3Star"),
      response: t("response3Star"),
      sentiment: t("sentiment3Star"),
      sentimentColor: "warning",
    },
    "1-star": {
      name: "David Chen",
      initials: "DC",
      stars: 1,
      text: t("review1Star"),
      response: t("response1Star"),
      sentiment: t("sentiment1Star"),
      sentimentColor: "danger",
    },
  };

  const TABS: { key: ReviewTab; label: string }[] = [
    { key: "5-star", label: t("tab5Star") },
    { key: "3-star", label: t("tab3Star") },
    { key: "1-star", label: t("tab1Star") },
  ];

  const [activeTab, setActiveTab] = useState<ReviewTab>("5-star");
  const [displayedText, setDisplayedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const review = REVIEWS[activeTab];

  const startTyping = useCallback(
    (text: string) => {
      setIsAnalyzing(true);
      setDisplayedText("");
      setIsTyping(false);

      const analyzeTimer = setTimeout(() => {
        setIsAnalyzing(false);
        setIsTyping(true);

        let index = 0;
        const interval = setInterval(() => {
          index++;
          setDisplayedText(text.slice(0, index));
          if (index >= text.length) {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 1000 / 30); // ~30 chars/sec

        return () => clearInterval(interval);
      }, 1000);

      return () => clearTimeout(analyzeTimer);
    },
    []
  );

  useEffect(() => {
    const cleanup = startTyping(review.response);
    return cleanup;
  }, [activeTab, review.response, startTyping]);

  function handleTabChange(tab: ReviewTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
  }

  return (
    <section className="py-[var(--section-padding-y)] px-[var(--section-padding-x)]">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          description={t("description")}
        />

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "gradient-button text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Two-panel display */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Left — Incoming Review */}
          <AnimatePresence mode="wait">
            <m.div
              key={`review-${activeTab}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-2xl bg-white p-6 border shadow-sm",
                review.sentimentColor === "success" && "border-l-4 border-l-success",
                review.sentimentColor === "warning" && "border-l-4 border-l-warning",
                review.sentimentColor === "danger" && "border-l-4 border-l-danger"
              )}
            >
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
                {t("incomingReview")}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold text-neutral-600">
                  {review.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {review.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating count={review.stars} />
                    <span className="text-xs text-neutral-400">{t("hoursAgo")}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </p>

              <Badge variant={review.sentimentColor}>{review.sentiment}</Badge>
            </m.div>
          </AnimatePresence>

          {/* Right — AI Response */}
          <AnimatePresence mode="wait">
            <m.div
              key={`response-${activeTab}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="rounded-2xl bg-white p-6 border border-neutral-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  {t("aiResponse")}
                </p>
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <Badge variant="primary" className="ml-auto text-[10px]">
                  Claude AI
                </Badge>
              </div>

              <div className="min-h-[160px]">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    {t("analyzingReview")}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    &ldquo;{displayedText}
                    {isTyping && (
                      <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-text-bottom" />
                    )}
                    {!isTyping && displayedText && "&rdquo;"}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                  {t("edit")}
                </span>
                <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                  {t("approve")}
                </span>
                <span className="text-xs text-white bg-success px-3 py-1.5 rounded-lg font-medium">
                  {t("publishToGoogle")} ✓
                </span>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500 italic mb-6">
            {t("timeComparison")}
          </p>
          <Button href="/signup">{t("tryIt")}</Button>
        </div>
      </div>
    </section>
  );
}
