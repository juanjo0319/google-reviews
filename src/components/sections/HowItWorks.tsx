import { Link2, Sparkles, SendHorizontal, ArrowRight, Check } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { StaggerContainer, StaggerItem } from "@/components/motion";

const STEPS = [
  {
    number: "1",
    icon: Link2,
    title: "Connect Your Google Business",
    description:
      "Link your Google Business Profile with one click. We securely access your reviews — nothing else.",
    visual: (
      <div className="mt-4 rounded-xl bg-neutral-50 p-4 border border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">
              Google Business
            </p>
            <p className="text-xs text-neutral-500">Connected</p>
          </div>
          <Check className="h-5 w-5 text-success" />
        </div>
      </div>
    ),
  },
  {
    number: "2",
    icon: Sparkles,
    title: "AI Reads & Analyzes Every Review",
    description:
      "Claude AI understands sentiment, identifies key themes, and flags urgent reviews that need attention.",
    visual: (
      <div className="mt-4 flex gap-2">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
          Positive
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
          Mixed
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-danger/10 text-danger">
          Negative
        </span>
      </div>
    ),
  },
  {
    number: "3",
    icon: SendHorizontal,
    title: "Review, Edit & Publish",
    description:
      "Get AI-drafted responses in your brand voice. Edit if needed, then publish directly to Google.",
    visual: (
      <div className="mt-4 rounded-xl bg-neutral-50 p-3 border border-neutral-100">
        <p className="text-xs text-neutral-500 mb-2">AI Draft ready</p>
        <div className="flex gap-2">
          <span className="text-xs text-neutral-400 bg-white px-2 py-1 rounded border border-neutral-100">
            Edit
          </span>
          <span className="text-xs text-white bg-primary px-2 py-1 rounded font-medium">
            Approve & Publish
          </span>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" background="muted">
      <SectionHeading
        eyebrow="How It Works"
        heading="Up and Running in Minutes"
        description="Three simple steps to never miss a review again."
      />

      <StaggerContainer className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
        {/* Desktop connectors */}
        <div className="hidden md:flex absolute top-20 left-[33%] w-[34%] items-center justify-center">
          <ArrowRight className="h-5 w-5 text-primary/30" />
        </div>
        <div className="hidden md:flex absolute top-20 right-[16%] w-[1%] items-center justify-center">
          <ArrowRight className="h-5 w-5 text-primary/30" />
        </div>

        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <StaggerItem key={step.number}>
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-neutral-100 hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                {/* Number badge + Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-button text-white text-sm font-bold">
                    {step.number}
                  </div>
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {step.description}
                </p>

                {step.visual}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="mt-12 text-center">
        <Button href="/signup">
          Get Started in 2 Minutes
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
