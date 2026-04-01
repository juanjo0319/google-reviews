import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "How RevUp.ai Compares",
  description:
    "See how RevUp.ai stacks up against Birdeye, Podium, ReviewTrackers, Reputation.com, and Yext. Honest feature and pricing comparisons.",
  alternates: { canonical: "/compare" },
};

const COMPARISONS = [
  {
    competitor: "Birdeye",
    href: "/compare/revup-vs-birdeye",
    tagline: "10x cheaper with AI-first focus vs. bloated enterprise suite",
    price: "$299+/mo",
  },
  {
    competitor: "Podium",
    href: "/compare/revup-vs-podium",
    tagline: "Review response specialist vs. messaging-focused platform",
    price: "$399+/mo",
  },
  {
    competitor: "ReviewTrackers",
    href: "/compare/revup-vs-reviewtrackers",
    tagline: "AI-powered responses vs. monitoring-only approach",
    price: "Contact Sales",
  },
  {
    competitor: "Reputation.com",
    href: "/compare/revup-vs-reputation-com",
    tagline: "SMB-friendly pricing vs. enterprise-grade complexity",
    price: "$500+/mo",
  },
  {
    competitor: "Yext",
    href: "/compare/revup-vs-yext",
    tagline: "Purpose-built review tool vs. listings management add-on",
    price: "Contact Sales",
  },
];

export default function ComparePage() {
  return (
    <>
      <SectionWrapper>
        <div className="pt-12">
          <SectionHeading
            heading="How RevUp.ai Compares"
            description="Transparent, honest comparisons so you can make the right choice for your business."
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {COMPARISONS.map((c) => (
            <Link
              key={c.competitor}
              href={c.href}
              className="group bg-white rounded-2xl p-6 border border-neutral-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-neutral-950">
                  vs {c.competitor}
                </h3>
                <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-neutral-600 mb-4">{c.tagline}</p>
              <p className="text-xs text-neutral-400">
                Their pricing:{" "}
                <span className="font-semibold text-neutral-500">
                  {c.price}
                </span>
              </p>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
