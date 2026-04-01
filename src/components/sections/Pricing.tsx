"use client";

import { useState } from "react";
import { CheckCircle2, Shield, CreditCard, Calendar, Link2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Billing = "monthly" | "annual";

const PLANS = [
  {
    name: "Starter",
    subtitle: "For small businesses getting started",
    monthly: 29,
    annual: 23,
    features: [
      "1 Google Business location",
      "Up to 100 AI responses/month",
      "Basic sentiment analysis",
      "Email notifications",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "secondary" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    subtitle: "For growing businesses that need more",
    monthly: 79,
    annual: 63,
    features: [
      "Up to 10 locations",
      "500 AI responses/month",
      "Advanced sentiment + trend analysis",
      "Brand voice customization",
      "Priority support",
      "Multi-user access (up to 10)",
      "Weekly digest reports",
    ],
    cta: "Start Free Trial",
    ctaVariant: "primary" as const,
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    subtitle: "For multi-location and franchise businesses",
    monthly: null,
    annual: null,
    features: [
      "Unlimited locations",
      "Unlimited AI responses",
      "Custom AI model training",
      "Dedicated account manager",
      "SSO & API access",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
    highlighted: false,
  },
];

const INCLUDES = [
  { icon: Calendar, text: "14-day free trial" },
  { icon: CreditCard, text: "No credit card" },
  { icon: Shield, text: "Cancel anytime" },
  { icon: Link2, text: "Google integration" },
];

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section
      id="pricing"
      className="py-[var(--section-padding-y)] px-[var(--section-padding-x)]"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Simple Pricing"
          heading="Start Free. Scale as You Grow."
          description="All plans include a 14-day free trial. No credit card required."
        />

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            className={cn(
              "text-sm font-medium",
              billing === "monthly" ? "text-neutral-900" : "text-neutral-400"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBilling((b) => (b === "monthly" ? "annual" : "monthly"))
            }
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              billing === "annual" ? "bg-primary" : "bg-neutral-200"
            )}
            aria-label={`Switch to ${billing === "monthly" ? "annual" : "monthly"} billing`}
          >
            <m.div
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
              animate={{ left: billing === "annual" ? "calc(100% - 1.625rem)" : "0.125rem" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium",
              billing === "annual" ? "text-neutral-900" : "text-neutral-400"
            )}
          >
            Annual
          </span>
          <AnimatePresence>
            {billing === "annual" && (
              <m.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="success">Save 20%</Badge>
              </m.span>
            )}
          </AnimatePresence>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl p-8 flex flex-col relative",
                plan.highlighted
                  ? "bg-white ring-2 ring-primary shadow-xl md:scale-105 z-10"
                  : "bg-white border border-neutral-200 shadow-sm"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    variant="primary"
                    className="gradient-button text-white border-0"
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <h3 className="font-heading text-xl font-bold text-neutral-900">
                {plan.name}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">{plan.subtitle}</p>

              <div className="mt-6 mb-8">
                {plan.monthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <m.span
                        key={billing}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-5xl font-bold font-heading text-neutral-900"
                      >
                        ${billing === "monthly" ? plan.monthly : plan.annual}
                      </m.span>
                    </AnimatePresence>
                    <span className="text-lg text-neutral-500">/mo</span>
                  </div>
                ) : (
                  <span className="text-5xl font-bold font-heading text-neutral-900">
                    Custom
                  </span>
                )}
                {billing === "annual" && plan.annual !== null && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Billed ${plan.annual * 12}/yr
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-sm text-neutral-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  href="/signup"
                  variant={plan.ctaVariant}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* All plans include */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
          {INCLUDES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-neutral-400" />
              {text}
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-neutral-400">
          Have questions?{" "}
          <a href="#faq" className="text-primary hover:underline">
            Check our FAQ
          </a>
        </p>
      </div>
    </section>
  );
}
