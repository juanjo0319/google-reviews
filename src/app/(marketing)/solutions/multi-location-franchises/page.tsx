import type { Metadata } from "next";
import {
  SolutionPage,
  type SolutionData,
} from "@/components/templates/SolutionPage";
import { Building2, MapPin, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Multi-Location Review Management",
  description:
    "Manage reviews across every franchise and branch from one dashboard. RevUp.ai maintains consistent brand voice per location while giving headquarters full visibility into reputation performance.",
  alternates: { canonical: "/solutions/multi-location-franchises" },
};

const DATA: SolutionData = {
  industry: "Multi-Location Franchises",
  heroTitle: "One Dashboard for Every Location's Reviews",
  heroDescription:
    "When you're managing 10, 50, or 500 locations, review management becomes a full-time job nobody signed up for. RevUp.ai gives headquarters a unified view of every location's reputation while empowering individual managers with AI-powered responses that match your brand guidelines.",
  painPoints: [
    {
      title: "Inconsistent Brand Voice",
      description:
        "Every location manager responds differently — some are too casual, some too formal, and some don't respond at all. Your brand reputation varies wildly from one storefront to the next.",
      icon: Building2,
    },
    {
      title: "Zero Visibility at the Top",
      description:
        "Corporate teams have no easy way to see which locations are thriving and which are struggling. Review performance data is siloed across dozens of Google Business profiles with no unified reporting.",
      icon: MapPin,
    },
    {
      title: "Impossible to Manage at Scale",
      description:
        "With hundreds of reviews pouring in across all locations every week, manual response is simply not feasible. Reviews go unanswered for days or weeks, eroding customer trust at every location.",
      icon: AlertTriangle,
    },
  ],
  features: [
    {
      title: "Per-Location Brand Voice Settings",
      description:
        "Configure distinct tone, talking points, and response guidelines for each location or region. A downtown flagship can sound different from a suburban family-friendly branch while both stay on brand.",
      relevance:
        "Each location feels local and authentic while corporate controls the guardrails.",
    },
    {
      title: "Centralized Analytics Dashboard",
      description:
        "See star ratings, response times, sentiment trends, and review volume across every location on a single screen. Filter by region, franchise group, or individual store.",
      relevance:
        "Spot underperforming locations instantly and take action before reputation damage spreads.",
    },
    {
      title: "Team Permissions & Workflows",
      description:
        "Give location managers permission to approve and publish responses for their own store while corporate retains oversight and the ability to review any response before it goes live.",
      relevance:
        "Empower local teams without losing centralized quality control.",
    },
    {
      title: "Automated Location-Specific Context",
      description:
        "The AI automatically references each location's address, local manager name, and unique offerings so responses feel personal rather than templated across your entire network.",
      relevance:
        "Customers know they're heard by their local team, not a faceless corporate office.",
    },
  ],
  exampleReview: {
    stars: 3,
    text: "The Westfield location used to be great but it's gone downhill. Long wait times, staff seemed disorganized, and the store wasn't as clean as I remember. The product itself is still good but the experience needs work.",
    response:
      "Thank you for your honest feedback about our Westfield location. We're glad you still enjoy the product, but we know the in-store experience needs to match that same standard. We've shared your comments about wait times and cleanliness directly with the Westfield management team, and they're already taking steps to address these issues. We'd love to welcome you back — please reach out to our Westfield manager, Jamie, at westfield@example.com for a complimentary visit so we can show you the improvements firsthand.",
  },
  stats: [
    {
      value: "100%",
      label: "Review response rate across all locations",
    },
    { value: "< 4 hrs", label: "Average response time per review" },
    {
      value: "0.4",
      label: "Average star rating increase within 90 days",
    },
    {
      value: "37%",
      label: "Reduction in corporate review management overhead",
    },
  ],
  testimonial: {
    quote:
      "We manage 120 locations and before RevUp.ai it was chaos. Some stores responded, most didn't, and the brand voice was all over the place. Now every single review gets a thoughtful, on-brand reply and I can see exactly how each location is performing from one screen.",
    name: "David Park",
    role: "VP of Brand & Customer Experience",
    company: "FreshBite Holdings",
  },
  ctaText: "Unify Your Reputation Across Every Location",
};

export default function MultiLocationFranchisesPage() {
  return <SolutionPage data={DATA} />;
}
