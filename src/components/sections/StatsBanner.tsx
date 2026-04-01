import { Building2, MessageSquare, Zap, Clock } from "lucide-react";
import { CountUp } from "@/components/motion";
import { getTranslations } from "next-intl/server";

export async function StatsBanner() {
  const t = await getTranslations("marketing.stats");

  const STATS = [
    {
      icon: Building2,
      target: 500,
      suffix: "+",
      label: t("businessesTrust"),
    },
    {
      icon: MessageSquare,
      target: 50000,
      suffix: "+",
      label: t("reviewsManaged"),
    },
    {
      icon: Zap,
      target: 4.2,
      suffix: "s",
      label: t("avgResponseTime"),
    },
    {
      icon: Clock,
      target: 10,
      suffix: "+ hrs",
      label: t("savedPerWeek"),
    },
  ];

  return (
    <section className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 py-16 md:py-20 overflow-hidden">
      {/* Subtle dot decoration */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`text-center ${
                  i < STATS.length - 1
                    ? "md:border-r md:border-white/10"
                    : ""
                }`}
              >
                <Icon className="h-8 w-8 text-primary-light mx-auto mb-3" />
                <p className="text-4xl md:text-5xl font-bold font-heading text-white">
                  <CountUp
                    target={stat.target}
                    suffix={stat.suffix}
                    duration={2}
                  />
                </p>
                <p className="text-sm text-neutral-300 mt-2">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
