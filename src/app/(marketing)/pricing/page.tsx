import type { Metadata } from "next";
import { Shield, ArrowRight, Mail } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Pricing } from "@/components/sections/Pricing";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = {
  title: "Pricing — Plans Starting at $29/mo",
  description:
    "Simple, transparent pricing for AI-powered Google review management. Start free for 14 days. No credit card required. Starter $29/mo, Pro $79/mo, Enterprise custom.",
  alternates: { canonical: "/pricing" },
};

const PRICING_FAQ = [
  {
    q: "Can I change plans anytime?",
    a: "Yes. Upgrade or downgrade at any time from your dashboard. Changes take effect immediately, and we'll prorate your billing.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise plans.",
  },
  {
    q: "Do you offer discounts for nonprofits or startups?",
    a: "Yes! Contact us at hello@revup.ai with details about your organization and we'll work out special pricing.",
  },
  {
    q: "What happens when my trial ends?",
    a: "If you don't add a payment method, your account will move to a free read-only mode. No data is deleted — you can reactivate anytime.",
  },
  {
    q: "Is there a setup fee?",
    a: "No. There are no setup fees, no hidden costs, and no long-term contracts. You pay only the monthly or annual subscription price.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "RevUp.ai",
          description:
            "AI-powered Google review management software",
          offers: [
            {
              "@type": "Offer",
              name: "Starter",
              price: "29",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "29",
                priceCurrency: "USD",
                billingDuration: "P1M",
              },
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "79",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "79",
                priceCurrency: "USD",
                billingDuration: "P1M",
              },
            },
          ],
        }}
      />

      {/* Hero */}
      <SectionWrapper>
        <div className="pt-12">
          <SectionHeading
            heading="Simple, Transparent Pricing"
            description="No hidden fees. No long contracts. Start free for 14 days."
          />
        </div>
      </SectionWrapper>

      {/* Pricing cards (reused component) */}
      <Pricing />

      {/* Money-Back Guarantee */}
      <SectionWrapper background="muted">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-3">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-neutral-600">
              If RevUp.ai doesn&apos;t save you time in the first 30 days,
              we&apos;ll refund every penny. No questions asked.
            </p>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Enterprise section */}
      <SectionWrapper>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-neutral-950 mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-neutral-600 text-lg mb-6">
              Enterprise plans include SSO, API access, custom AI model
              training, dedicated account manager, and tailored integrations
              for your tech stack.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/contact" size="lg">
                Talk to Sales
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                Or email enterprise@revup.ai
              </p>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Pricing FAQ */}
      <SectionWrapper background="muted">
        <SectionHeading heading="Pricing FAQ" />
        <div className="max-w-3xl mx-auto space-y-6">
          {PRICING_FAQ.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl p-6 border border-neutral-100">
              <h3 className="font-heading font-semibold text-neutral-900 mb-2">
                {q}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
