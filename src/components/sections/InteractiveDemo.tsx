"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Sparkles, Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type ReviewTab = "5-star" | "3-star" | "1-star";

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
    text: "Absolutely wonderful experience! The staff went above and beyond to make our anniversary dinner special. The food was incredible, and the ambiance was perfect. Will definitely be coming back!",
    response:
      "Thank you so much, Sarah! We're thrilled that we could make your anniversary celebration special. Our team takes great pride in creating memorable dining experiences, and your kind words mean the world to us. We look forward to welcoming you back soon — perhaps we can make your next visit equally unforgettable!",
    sentiment: "Positive",
    sentimentColor: "success",
  },
  "3-star": {
    name: "James Wilson",
    initials: "JW",
    stars: 3,
    text: "Food was decent but the wait was too long for a Tuesday night. Server was friendly but seemed overwhelmed. Might give it another shot but they need to work on timing.",
    response:
      "Hi James, thank you for your honest feedback. You're right — wait times on that evening didn't meet our standards, and we're addressing this with additional staffing during peak hours. We'd love the chance to show you the experience we're known for. If you visit again, please ask for a manager — we'll make sure your next visit is seamless.",
    sentiment: "Mixed",
    sentimentColor: "warning",
  },
  "1-star": {
    name: "David Chen",
    initials: "DC",
    stars: 1,
    text: "Terrible service. Waited 45 minutes for appetizers, food was cold when it arrived, and the manager was dismissive when we complained. Won't be returning.",
    response:
      "David, I sincerely apologize for this experience — it falls far below what we strive for. Cold food and long waits are unacceptable, and a dismissive response makes it worse. I'd like to make this right personally. Could you email me at manager@restaurant.com? I want to understand what happened and ensure it doesn't happen again.",
    sentiment: "Negative",
    sentimentColor: "danger",
  },
};

const TABS: { key: ReviewTab; label: string }[] = [
  { key: "5-star", label: "5-Star Review" },
  { key: "3-star", label: "3-Star Review" },
  { key: "1-star", label: "1-Star Review" },
];

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
          eyebrow="See It In Action"
          heading="Watch AI Craft the Perfect Response"
          description="Select a review type below and see how RevUp.ai responds."
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
                Incoming Review
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
                    <span className="text-xs text-neutral-400">2 hours ago</span>
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
                  AI Response
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
                    Analyzing review...
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
                  Edit
                </span>
                <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                  Approve
                </span>
                <span className="text-xs text-white bg-success px-3 py-1.5 rounded-lg font-medium">
                  Publish to Google ✓
                </span>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500 italic mb-6">
            That took 4 seconds. Manually? 10 minutes.
          </p>
          <Button href="/signup">Try It With Your Reviews</Button>
        </div>
      </div>
    </section>
  );
}
