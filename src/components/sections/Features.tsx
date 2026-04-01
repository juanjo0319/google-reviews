import { Sparkles, BarChart3, Bell, Settings, Clock, MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { StaggerContainer, StaggerItem } from "@/components/motion";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Smart AI Responses",
    description:
      "Powered by Claude AI, responses match your brand voice — professional, friendly, or whatever tone you set.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    description:
      "Every review scored for sentiment with key themes extracted. Know what customers love and what needs fixing.",
    accent: "bg-success/10 text-success",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description:
      "Get alerted the moment a new review comes in. Negative reviews trigger urgent alerts so you respond fast.",
    accent: "bg-warning/10 text-warning",
  },
  {
    icon: Settings,
    title: "Brand Voice Control",
    description:
      "Set your tone, preferred phrases, and response style. Every AI response sounds unmistakably you.",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description:
      "Businesses with 50+ monthly reviews save an average of 10 hours per week. That's time back for what matters.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    title: "Multi-Location Support",
    description:
      "Manage reviews across all your locations from one dashboard. Set different brand voices per location.",
    accent: "bg-accent/10 text-accent",
  },
];

export function Features() {
  return (
    <SectionWrapper id="features">
      <SectionHeading
        eyebrow="Features"
        heading="Everything You Need to Master Your Reviews"
        description="One platform to monitor, analyze, and respond to every Google review with AI precision."
      />

      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <StaggerItem key={feature.title}>
              <div className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-lg hover:border-neutral-200/60 hover:-translate-y-1 transition-all h-full">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.accent} mb-4`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="mt-12 text-center">
        <Button href="/features" variant="secondary">
          Explore All Features
        </Button>
      </div>
    </SectionWrapper>
  );
}
