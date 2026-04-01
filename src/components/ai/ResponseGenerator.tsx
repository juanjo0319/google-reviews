"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Loader2,
  Copy,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ResponseGeneratorProps {
  reviewId: string;
  onResponseSaved?: (content: string) => void;
}

export function ResponseGenerator({
  reviewId,
  onResponseSaved,
}: ResponseGeneratorProps) {
  const t = useTranslations("dashboard.ai");
  const [copied, setCopied] = useState(false);

  const { completion, isLoading, complete, setCompletion } = useCompletion({
    api: "/api/ai/generate-response",
    body: { reviewId },
  });

  async function generate(overrides?: Record<string, string>) {
    setCompletion("");
    await complete("generate", {
      body: { reviewId, ...overrides },
    });
  }

  async function handleCopy() {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-slate-900">
          {t("responseGenerator")}
        </h3>
      </div>

      {/* Generate button */}
      {!completion && !isLoading && (
        <button
          onClick={() => generate()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {t("generateAiResponse")}
        </button>
      )}

      {/* Loading state */}
      {isLoading && !completion && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("generatingResponse")}
        </div>
      )}

      {/* Generated response with typewriter effect */}
      {completion && (
        <div className="space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 min-h-[80px]">
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {completion}
              {isLoading && (
                <span className="inline-block w-1.5 h-4 bg-primary/50 animate-pulse ml-0.5 -mb-0.5" />
              )}
            </p>
          </div>

          {/* Action buttons */}
          {!isLoading && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generate()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t("regenerate")}
              </button>
              <button
                onClick={() => generate({ shorterOrLonger: "shorter" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                {t("shorter")}
              </button>
              <button
                onClick={() => generate({ adjustTone: "more formal" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" />
                {t("moreFormal")}
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? t("copied") : t("copy")}
              </button>
              {onResponseSaved && (
                <button
                  onClick={() => onResponseSaved(completion)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors ml-auto"
                >
                  <Check className="h-3.5 w-3.5" />
                  {t("saveAsDraft")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
