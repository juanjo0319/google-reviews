import { CheckCircle2, ArrowRight, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export type SolutionData = {
  industry: string;
  heroTitle: string;
  heroDescription: string;
  painPoints: { title: string; description: string; icon: LucideIcon }[];
  features: { title: string; description: string; relevance: string }[];
  exampleReview: { stars: number; text: string; response: string };
  stats: { value: string; label: string }[];
  testimonial: { quote: string; name: string; role: string; company: string };
  ctaText: string;
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? "fill-warning text-warning" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
}

export function SolutionPage({ data }: { data: SolutionData }) {
  return (
    <>
      {/* Hero */}
      <SectionWrapper>
        <div className="pt-12">
          <SectionHeading
            eyebrow={`Solutions for ${data.industry}`}
            heading={data.heroTitle}
            description={data.heroDescription}
          />
        </div>
      </SectionWrapper>

      {/* Pain points */}
      <SectionWrapper background="muted">
        <SectionHeading
          eyebrow="The Challenge"
          heading={`Review Management Challenges for ${data.industry}`}
        />
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {data.painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <StaggerItem key={point.title}>
                <div className="bg-white rounded-xl p-6 border border-neutral-100 h-full">
                  <Icon className="h-8 w-8 text-danger mb-4" />
                  <h3 className="font-heading font-semibold text-neutral-900 mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </SectionWrapper>

      {/* How RevUp.ai helps */}
      <SectionWrapper>
        <SectionHeading
          eyebrow="The Solution"
          heading={`How RevUp.ai Helps ${data.industry}`}
        />
        <div className="space-y-6 max-w-3xl mx-auto">
          {data.features.map((feat) => (
            <FadeIn key={feat.title}>
              <div className="bg-white rounded-xl p-6 border border-neutral-100">
                <h3 className="font-heading font-semibold text-neutral-900 mb-1">
                  {feat.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  {feat.description}
                </p>
                <p className="text-xs text-primary font-medium">
                  {feat.relevance}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionWrapper>

      {/* Example review */}
      <SectionWrapper background="muted">
        <SectionHeading
          eyebrow="See It in Action"
          heading={`AI Response for a ${data.industry} Review`}
        />
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-neutral-100">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
              Customer Review
            </p>
            <StarRating count={data.exampleReview.stars} />
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              &ldquo;{data.exampleReview.text}&rdquo;
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                AI Response
              </p>
              <Badge variant="primary" className="text-[10px]">
                Claude AI
              </Badge>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              &ldquo;{data.exampleReview.response}&rdquo;
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Stats */}
      <SectionWrapper background="dark">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-3xl md:text-4xl font-bold text-white">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Testimonial */}
      <SectionWrapper>
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-neutral-700 italic leading-relaxed mb-6">
              &ldquo;{data.testimonial.quote}&rdquo;
            </p>
            <p className="font-semibold text-neutral-900">
              {data.testimonial.name}
            </p>
            <p className="text-sm text-neutral-500">
              {data.testimonial.role}, {data.testimonial.company}
            </p>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper background="gradient">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            {data.ctaText}
          </h2>
          <p className="text-white/70 mb-8">
            14-day free trial. No credit card required.
          </p>
          <Button
            href="/signup"
            variant="secondary"
            size="lg"
            className="bg-white text-primary hover:bg-white/90 border-0"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
