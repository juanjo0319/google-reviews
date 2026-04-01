import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { LogoBar } from "@/components/sections/LogoBar";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { InteractiveDemo } from "@/components/sections/InteractiveDemo";
import { StatsBanner } from "@/components/sections/StatsBanner";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title:
    "RevUp.ai — AI-Powered Google Review Management | Respond to Every Review Automatically",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "RevUp.ai",
          url: "https://revup.ai",
          logo: "https://revup.ai/logo.png",
          sameAs: [
            "https://twitter.com/revupai",
            "https://linkedin.com/company/revupai",
            "https://github.com/revupai",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            email: "support@revup.ai",
            contactType: "customer service",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "RevUp.ai",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "29",
            highPrice: "79",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "150",
          },
        }}
      />

      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <InteractiveDemo />
      <StatsBanner />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
