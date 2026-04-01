import type { Metadata } from "next";
import {
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = {
  title: "Features — AI Review Responses, Sentiment Analysis & More",
  description:
    "Explore RevUp.ai's complete feature set: AI-powered review responses, sentiment analysis, brand voice control, multi-location management, and instant notifications.",
  alternates: { canonical: "/features" },
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "Smart AI Responses",
    color: "bg-primary/10 text-primary",
    description:
      "Every response is crafted by Claude AI to match your exact brand voice. No templates — each reply is unique, context-aware, and sounds authentically human.",
    bullets: [
      "Personalized responses for every review",
      "Automatic tone matching to your brand guidelines",
      "Multi-language response support",
      "One-click approval or manual editing",
    ],
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    color: "bg-success/10 text-success",
    description:
      "Understand what customers truly feel. Every review is scored for sentiment, with key themes extracted so you can spot trends before they become problems.",
    bullets: [
      "Real-time sentiment scoring (positive, mixed, negative)",
      "Theme extraction and trend analysis",
      "Location-level sentiment comparisons",
      "Weekly sentiment digest reports",
    ],
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    color: "bg-warning/10 text-warning",
    description:
      "Never let a review sit unanswered. Get alerted the moment a new review comes in — with negative reviews triggering urgent priority alerts.",
    bullets: [
      "Real-time email and in-app notifications",
      "Urgent alerts for negative reviews",
      "Customizable notification preferences",
      "Daily and weekly digest options",
    ],
  },
  {
    icon: Settings,
    title: "Brand Voice Control",
    color: "bg-accent/10 text-accent",
    description:
      "Your AI responses should sound like you, not a robot. Set your tone, preferred phrases, response style, and the AI adapts to match your brand perfectly.",
    bullets: [
      "Tone and formality settings",
      "Custom phrase libraries",
      "Example response training",
      "Per-location voice settings",
    ],
  },
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    color: "bg-primary/10 text-primary",
    description:
      "Businesses with 50+ monthly reviews save an average of 10 hours per week. That's time back for running your business instead of writing repetitive responses.",
    bullets: [
      "Automated draft generation for every review",
      "Batch approval for routine responses",
      "Auto-publish option for trusted responses",
      "Response templates for edge cases",
    ],
  },
  {
    icon: MapPin,
    title: "Multi-Location Support",
    color: "bg-accent/10 text-accent",
    description:
      "Manage reviews across all your Google Business locations from one dashboard. Each location gets its own brand voice, analytics, and team permissions.",
    bullets: [
      "Unified dashboard for all locations",
      "Per-location brand voice and settings",
      "Team roles and permissions",
      "Location performance comparisons",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper>
        <div className="pt-12">
          <SectionHeading
            eyebrow="Features"
            heading="Built for Businesses That Care About Reviews"
            description="Every feature designed to save you time, protect your reputation, and turn reviews into growth."
          />
        </div>
      </SectionWrapper>

      {/* Feature deep-dives */}
      {FEATURES.map((feature, i) => {
        const Icon = feature.icon;
        const isReversed = i % 2 === 1;

        return (
          <SectionWrapper
            key={feature.title}
            background={i % 2 === 0 ? "default" : "muted"}
          >
            <FadeIn>
              <div
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  isReversed ? "md:direction-rtl" : ""
                }`}
              >
                {/* Text */}
                <div className={isReversed ? "md:order-2" : ""}>
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} mb-5`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-neutral-950 mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-neutral-600 text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-neutral-700"
                      >
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual placeholder */}
                <div className={isReversed ? "md:order-1" : ""}>
                  <div className="rounded-2xl bg-neutral-100 border border-neutral-200 shadow-xl aspect-[4/3] flex items-center justify-center">
                    <Icon className="h-16 w-16 text-neutral-300" />
                  </div>
                </div>
              </div>
            </FadeIn>
          </SectionWrapper>
        );
      })}

      {/* Powered by Claude AI */}
      <SectionWrapper background="gradient">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <BrainCircuit className="h-12 w-12 text-white/80 mx-auto mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Powered by Claude AI
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-4">
              RevUp.ai is built on Anthropic&apos;s Claude AI — one of the
              world&apos;s most capable and trusted AI models. Unlike generic AI
              tools, Claude is designed for safety, accuracy, and natural language
              quality.
            </p>
            <p className="text-white/60 mb-8">
              That means review responses that are thoughtful, context-aware, and
              genuinely helpful — not robotic templates.
            </p>
            <Button
              href="https://anthropic.com/claude"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 border-0"
            >
              Learn more about Claude AI
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Bottom CTA */}
      <SectionWrapper>
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-neutral-950 mb-4">
            Ready to See It in Action?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-lg mx-auto">
            Start your 14-day free trial and experience every feature
            firsthand.
          </p>
          <Button href="/signup" size="lg">
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
