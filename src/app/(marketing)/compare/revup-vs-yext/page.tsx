import type { Metadata } from "next";
import {
  ComparisonPage,
  type ComparisonData,
} from "@/components/templates/ComparisonPage";

export const metadata: Metadata = {
  title:
    "RevUp.ai vs Yext Reviews (2026) — Features, Pricing & Honest Comparison",
  description:
    "Honest comparison of RevUp.ai and Yext Reviews for Google review management. See features, pricing, and which tool is right for your business.",
  alternates: { canonical: "/compare/revup-vs-yext" },
};

const DATA: ComparisonData = {
  competitorName: "Yext",
  heroTitle: "RevUp.ai vs Yext Reviews: Which Review Tool Is Right for You?",
  tldr: "Yext is primarily a listings and knowledge management platform — reviews are one module in a much larger suite. RevUp.ai is built from the ground up for AI review response, powered by Claude AI, starting at $29/mo. If you need intelligent review responses (not just listings sync), RevUp.ai is purpose-built for the job at a fraction of the cost.",
  comparisonTable: [
    { feature: "AI review response generation", revup: true, competitor: "Basic", category: "AI Response" },
    { feature: "Named AI model (Claude)", revup: true, competitor: false, category: "AI Response" },
    { feature: "Brand voice customization", revup: true, competitor: false, category: "AI Response" },
    { feature: "Response approval workflow", revup: true, competitor: "Limited", category: "AI Response" },
    { feature: "Auto-publish responses", revup: true, competitor: false, category: "AI Response" },
    { feature: "Sentiment analysis", revup: true, competitor: true, category: "Analytics" },
    { feature: "Trend analysis", revup: true, competitor: "Basic", category: "Analytics" },
    { feature: "Review monitoring", revup: true, competitor: true, category: "Analytics" },
    { feature: "Listings management (200+ directories)", revup: false, competitor: true, category: "Listings & Search" },
    { feature: "Knowledge graph / structured data", revup: false, competitor: true, category: "Listings & Search" },
    { feature: "Pages (location landing pages)", revup: false, competitor: true, category: "Listings & Search" },
    { feature: "Google Business integration", revup: true, competitor: true, category: "Integrations" },
    { feature: "Multi-location management", revup: true, competitor: true, category: "Integrations" },
    { feature: "Transparent pricing", revup: "From $29/mo", competitor: "$199+/mo per location", category: "Pricing" },
    { feature: "Free trial (no credit card)", revup: true, competitor: false, category: "Pricing" },
    { feature: "Self-serve signup", revup: true, competitor: "Demo required", category: "Pricing" },
  ],
  prosConsRevup: {
    pros: [
      "Purpose-built for AI review response — not an afterthought",
      "Superior AI powered by Claude (named, trusted model)",
      "Auto-publish saves hours of manual response work",
      "Brand voice customization for consistent replies",
      "Transparent pricing from $29/mo",
      "14-day free trial, no credit card required",
    ],
    cons: [
      "No listings management or directory sync",
      "No knowledge graph or structured data tools",
      "No location landing pages",
      "Newer product with smaller market presence",
    ],
  },
  prosConsCompetitor: {
    pros: [
      "Industry-leading listings management across 200+ directories",
      "Knowledge graph for structured business data",
      "Location pages for local SEO",
      "Review monitoring across multiple sites",
      "Well-established enterprise platform",
    ],
    cons: [
      "Review response is a secondary feature — not the core product",
      "AI response capabilities are basic (no named model)",
      "No auto-publish for AI-generated review responses",
      "Expensive — $199+/mo per location adds up fast",
      "Requires sales demo and annual contracts",
      "Listings-first platform — reviews are bolted on",
    ],
  },
  pricingComparison: {
    revup: "From $29/mo",
    competitor: "$199+/mo per location",
    verdict:
      "Yext's per-location pricing can add up quickly for multi-location businesses. RevUp.ai's focused pricing starts at $29/mo and delivers the core capability Yext lacks — intelligent, AI-powered review response generation and auto-publishing.",
  },
  verdict:
    "Choose RevUp.ai if your primary need is responding to Google reviews with high-quality, AI-generated replies — it's purpose-built for that job. Choose Yext if your main priority is listings management, local SEO, and directory sync across 200+ sites, and reviews are a secondary concern.",
  relatedComparisons: [
    { label: "vs Birdeye", href: "/compare/revup-vs-birdeye" },
    { label: "vs Podium", href: "/compare/revup-vs-podium" },
    { label: "vs ReviewTrackers", href: "/compare/revup-vs-reviewtrackers" },
    { label: "vs Reputation.com", href: "/compare/revup-vs-reputation-com" },
  ],
};

export default function RevUpVsYext() {
  return <ComparisonPage data={DATA} />;
}
