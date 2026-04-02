"use client";

import { Sparkles } from "lucide-react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import * as m from "motion/react-client";
import { useTranslations } from "next-intl";

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
      ))}
    </div>
  );
}

export function HeroDashboardPreview() {
  const t = useTranslations("marketing.hero.dashboardPreview");

  return (
    <m.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Glow behind cards */}
      <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-40" />

      <div className="relative space-y-4">
        {/* Review notification card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="rounded-2xl bg-white p-5 shadow-2xl border border-neutral-100 -rotate-1"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-sm font-semibold text-warning">
              SM
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Sarah M.
              </p>
              <StarRating count={5} />
            </div>
            <span className="ml-auto text-xs text-neutral-400">{t("justNow")}</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {t("reviewText")}
          </p>
        </m.div>

        {/* AI Response card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="rounded-2xl bg-white p-5 shadow-2xl border border-neutral-100 rotate-1"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              {t("aiResponse")}
            </span>
            <Badge variant="primary" className="ml-auto text-[10px]">
              Claude AI
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {t("responseText")}
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
              {t("edit")}
            </span>
            <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
              {t("approve")}
            </span>
            <span className="text-xs text-white bg-success px-3 py-1.5 rounded-lg font-medium">
              {t("publish")} ✓
            </span>
          </div>
        </m.div>
      </div>
    </m.div>
  );
}
