"use client";

import { ArrowRight, Play, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/motion/FadeIn";
import * as m from "motion/react-client";

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
      ))}
    </div>
  );
}

function DashboardPreview() {
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
            <span className="ml-auto text-xs text-neutral-400">Just now</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            &ldquo;Absolutely wonderful experience! The staff went above and
            beyond to make our anniversary dinner special...&rdquo;
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
              AI Response
            </span>
            <Badge variant="primary" className="ml-auto text-[10px]">
              Claude AI
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            &ldquo;Thank you so much, Sarah! We&apos;re thrilled that we could
            make your anniversary celebration special. Our team takes great
            pride in creating memorable dining experiences...&rdquo;
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
              Edit
            </span>
            <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
              Approve
            </span>
            <span className="text-xs text-white bg-success px-3 py-1.5 rounded-lg font-medium">
              Publish ✓
            </span>
          </div>
        </m.div>
      </div>
    </m.div>
  );
}

export function Hero() {
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
                Powered by Claude AI
              </Badge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.08]">
                Every Review Answered.{" "}
                <span className="gradient-text-hero">Automatically.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg lg:text-xl text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect your Google Business Profile and let AI read, analyze,
                and craft the perfect response to every customer review — in
                your brand&apos;s voice.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button href="/signup" size="lg">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="#how-it-works" variant="outline" size="lg">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="mt-4 text-sm text-neutral-500">
                No credit card required &middot; 14-day free trial &middot;
                Setup in 2 minutes
              </p>
            </FadeIn>

            {/* Social proof strip */}
            <FadeIn delay={0.5}>
              <div className="mt-8 pt-8 border-t border-neutral-100">
                <p className="text-sm font-medium text-neutral-500 mb-4">
                  Trusted by 500+ businesses
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
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
