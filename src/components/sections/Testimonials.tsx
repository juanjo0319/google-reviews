import { Quote } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { StaggerContainer, StaggerItem } from "@/components/motion";

const TESTIMONIALS = [
  {
    quote:
      "RevUp.ai cut our review response time from 2 days to 2 hours. The AI responses are so good, customers think a real person wrote them.",
    name: "Jessica Rivera",
    role: "Owner, Rivera's Kitchen",
    initials: "JR",
    stat: "90% faster response time",
  },
  {
    quote:
      "Managing reviews across 12 locations was a nightmare. Now it's a 15-minute daily check. The sentiment analysis helps us spot issues before they become patterns.",
    name: "Marcus Thompson",
    role: "Operations Director, Apex Dental Group",
    initials: "MT",
    stat: "12 locations, 1 dashboard",
  },
  {
    quote:
      "We went from a 3.6 to a 4.4 star average in 3 months. Turns out, just responding to every review makes a massive difference — and RevUp.ai makes it effortless.",
    name: "Amanda Chen",
    role: "GM, Harbor Hotels",
    initials: "AC",
    stat: "3.6 → 4.4 stars in 3 months",
  },
];

export function Testimonials() {
  return (
    <SectionWrapper>
      <SectionHeading
        eyebrow="Loved by Businesses"
        heading="Don't Take Our Word for It"
      />

      {/* Desktop: grid, Mobile: horizontal scroll */}
      <StaggerContainer className="grid md:grid-cols-3 gap-6 max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:-mx-4 max-md:px-4 max-md:gap-4">
        {TESTIMONIALS.map((t) => (
          <StaggerItem
            key={t.name}
            className="max-md:min-w-[85vw] max-md:snap-center"
          >
            <div className="bg-white rounded-2xl p-8 border border-neutral-100 h-full flex flex-col">
              {/* Decorative quote */}
              <Quote className="h-8 w-8 text-primary/10 mb-4" />

              {/* Quote */}
              <p className="text-neutral-700 text-base italic leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Stat badge */}
              <Badge variant="primary" className="mt-4 self-start">
                {t.stat}
              </Badge>

              {/* Divider */}
              <div className="border-t border-neutral-100 mt-6 pt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-button flex items-center justify-center text-sm font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SectionWrapper>
  );
}
