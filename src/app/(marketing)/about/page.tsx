import type { Metadata } from "next";
import {
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
  BrainCircuit,
  Shield,
  Heart,
} from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "About RevUp.ai — Our Mission",
  description:
    "Learn about RevUp.ai's mission to help every business respond to every customer review with the power of AI. Built on Claude AI by Anthropic.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "We believe you should always know what AI is doing on your behalf. Every response is a draft — you approve before it goes live. No black boxes, no hidden agendas.",
  },
  {
    icon: Sparkles,
    title: "Quality",
    description:
      "We chose Claude AI because it produces the most thoughtful, nuanced responses available. We never sacrifice quality for speed. Every reply should sound authentically human.",
  },
  {
    icon: Layers,
    title: "Simplicity",
    description:
      "Powerful technology should be invisible. Connect your Google Business Profile, set your preferences, and let RevUp.ai handle the rest. No learning curve, no complexity.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper>
        <div className="pt-16 pb-8 text-center max-w-3xl mx-auto">
          <FadeIn>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-950 mb-6">
              We Believe Every Review Deserves a Response
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
              RevUp.ai was founded on a simple idea: no customer should feel
              ignored. Whether they left a glowing 5-star review or a frustrated
              1-star complaint, every person who takes the time to share their
              experience deserves a thoughtful reply.
            </p>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* Mission */}
      <SectionWrapper background="muted">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="Our Mission"
              heading="Helping Businesses Build Lasting Customer Relationships"
              align="left"
            />
            <div className="prose prose-lg prose-neutral max-w-none">
              <p>
                For most small and medium businesses, responding to reviews is a
                task that falls to the bottom of the list. Owners are busy
                running their operations, managing staff, and serving customers.
                Meanwhile, unanswered reviews pile up — each one a missed
                opportunity to build trust, improve SEO, and win back a customer.
              </p>
              <p>
                RevUp.ai changes that equation. By connecting your Google
                Business Profile to our platform, every new review is
                automatically analyzed and a personalized, brand-aligned response
                is drafted for your approval. What used to take hours per week
                now takes minutes.
              </p>
              <p>
                We built RevUp.ai for the restaurant owner who gets 50 reviews a
                month but can only respond to 5. For the dental practice that
                wants to address patient concerns but doesn&apos;t know what to
                say. For the hotel chain that needs consistent, professional
                responses across 200 locations.
              </p>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* Why Claude AI */}
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 mb-4">
                  Why Claude AI?
                </h2>
                <div className="prose prose-lg prose-neutral max-w-none">
                  <p>
                    Not all AI is created equal. We chose{" "}
                    <strong>Claude by Anthropic</strong> as the engine behind
                    RevUp.ai because it excels at the nuance, empathy, and
                    context-awareness that review responses demand.
                  </p>
                  <p>
                    Claude understands that a 1-star review about a cold meal
                    requires a different tone than a 1-star review about rude
                    service. It grasps that a dental patient expressing anxiety
                    needs compassion, not corporate platitudes. It adapts to your
                    brand voice — whether that is formal and polished or warm
                    and casual.
                  </p>
                  <p>
                    We also chose Claude for its commitment to safety and
                    honesty. Anthropic builds AI that is helpful, harmless, and
                    honest — values that align perfectly with ours. Your
                    customers will never receive a response that is misleading,
                    inappropriate, or off-brand.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper background="muted">
        <SectionHeading
          eyebrow="Our Values"
          heading="What We Stand For"
          description="The principles that guide everything we build."
        />
        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {VALUES.map((value) => (
            <StaggerItem key={value.title}>
              <div className="bg-white rounded-2xl border border-neutral-100 p-8 h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-5">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-neutral-950 mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-950 mb-4">
              Ready to Never Miss a Review Again?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Join thousands of businesses that use RevUp.ai to turn every
              review into a relationship-building opportunity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/signup" size="lg">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Talk to Us
              </Button>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>
    </>
  );
}
