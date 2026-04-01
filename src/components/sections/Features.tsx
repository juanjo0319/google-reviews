import { Sparkles, BarChart3, Bell, Settings, Clock, MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { getTranslations } from "next-intl/server";

export async function Features() {
  const t = await getTranslations("marketing.features");

  const FEATURES = [
    {
      icon: Sparkles,
      title: t("smartAiResponses"),
      description: t("smartAiResponsesDesc"),
      accent: "bg-primary/10 text-primary",
    },
    {
      icon: BarChart3,
      title: t("sentimentAnalysis"),
      description: t("sentimentAnalysisDesc"),
      accent: "bg-success/10 text-success",
    },
    {
      icon: Bell,
      title: t("instantNotifications"),
      description: t("instantNotificationsDesc"),
      accent: "bg-warning/10 text-warning",
    },
    {
      icon: Settings,
      title: t("brandVoiceControl"),
      description: t("brandVoiceControlDesc"),
      accent: "bg-accent/10 text-accent",
    },
    {
      icon: Clock,
      title: t("saveTime"),
      description: t("saveTimeDesc"),
      accent: "bg-primary/10 text-primary",
    },
    {
      icon: MapPin,
      title: t("multiLocation"),
      description: t("multiLocationDesc"),
      accent: "bg-accent/10 text-accent",
    },
  ];

  return (
    <SectionWrapper id="features">
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        description={t("description")}
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
          {t("exploreAll")}
        </Button>
      </div>
    </SectionWrapper>
  );
}
