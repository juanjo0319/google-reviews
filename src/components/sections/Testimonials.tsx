import { Quote } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { getTranslations } from "next-intl/server";

export async function Testimonials() {
  const t = await getTranslations("marketing.testimonials");

  const TESTIMONIALS = [
    {
      quote: t("quote1"),
      name: "Jessica Rivera",
      role: "Owner, Rivera's Kitchen",
      initials: "JR",
      stat: t("stat1"),
    },
    {
      quote: t("quote2"),
      name: "Marcus Thompson",
      role: "Operations Director, Apex Dental Group",
      initials: "MT",
      stat: t("stat2"),
    },
    {
      quote: t("quote3"),
      name: "Amanda Chen",
      role: "GM, Harbor Hotels",
      initials: "AC",
      stat: t("stat3"),
    },
  ];

  return (
    <SectionWrapper>
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
      />

      {/* Desktop: grid, Mobile: horizontal scroll */}
      <StaggerContainer className="grid md:grid-cols-3 gap-6 max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:-mx-4 max-md:px-4 max-md:gap-4">
        {TESTIMONIALS.map((item) => (
          <StaggerItem
            key={item.name}
            className="max-md:min-w-[85vw] max-md:snap-center"
          >
            <div className="bg-white rounded-2xl p-8 border border-neutral-100 h-full flex flex-col">
              {/* Decorative quote */}
              <Quote className="h-8 w-8 text-primary/10 mb-4" />

              {/* Quote */}
              <p className="text-neutral-700 text-base italic leading-relaxed flex-1">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Stat badge */}
              <Badge variant="primary" className="mt-4 self-start">
                {item.stat}
              </Badge>

              {/* Divider */}
              <div className="border-t border-neutral-100 mt-6 pt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-button flex items-center justify-center text-sm font-semibold text-white">
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">{item.role}</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SectionWrapper>
  );
}
