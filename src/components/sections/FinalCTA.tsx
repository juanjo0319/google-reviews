import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";

export async function FinalCTA() {
  const t = await getTranslations("marketing.finalCta");

  return (
    <section className="px-[var(--section-padding-x)] py-20 md:py-28 mb-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-accent px-8 py-16 md:px-16 md:py-24 text-center">
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/10 rounded-full blur-3xl" />

          <div className="relative">
            <FadeIn>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-white">
                {t("heading")}
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mt-4">
                {t("subtitle")}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  href="/signup"
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 border-0"
                >
                  {t("startTrial")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  href="/contact"
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {t("bookDemo")}
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-4 text-sm text-white/60">
                {t("noCreditCard")} &middot; {t("cancelAnytime")}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
