"use client";

import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/motion/FadeIn";
import { HeroDashboardPreview } from "./HeroDashboardPreview";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("marketing.hero");

  return (
    <section className="relative overflow-hidden bg-dot-pattern">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="text-center lg:text-left">
            <FadeIn delay={0}>
              <Badge variant="primary" className="gap-1.5 mb-6 border border-primary/10">
                <Sparkles className="h-3.5 w-3.5" />
                {t("badge")}
              </Badge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.08]">
                {t("titleLine1")}{" "}
                <span className="gradient-text-hero">{t("titleLine2")}</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg lg:text-xl text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t("subtitle")}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button href="/signup" size="lg">
                  {t("startFreeTrial")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#how-it-works" variant="outline" size="lg">
                  <Play className="h-4 w-4" />
                  {t("watchDemo")}
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="mt-4 text-sm text-neutral-500">
                {t("noCredit")} &middot; {t("freeTrial")} &middot;{" "}
                {t("setupTime")}
              </p>
            </FadeIn>

            {/* Social proof strip */}
            <FadeIn delay={0.5}>
              <div className="mt-8 pt-8 border-t border-neutral-100">
                <p className="text-sm font-medium text-neutral-500 mb-4">
                  {t("trustedBy")}
                </p>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-20 rounded bg-neutral-100 opacity-50"
                    />
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right — Product visual */}
          <div className="hidden lg:block">
            <HeroDashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
