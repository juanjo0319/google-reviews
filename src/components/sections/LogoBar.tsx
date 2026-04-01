import { MarqueeLogos } from "@/components/motion";
import { getTranslations } from "next-intl/server";

const LOGOS = [
  { name: "Maple & Co", src: "/logos/maple-co.svg" },
  { name: "TechPoint", src: "/logos/techpoint.svg" },
  { name: "GreenLeaf", src: "/logos/greenleaf.svg" },
  { name: "BluePeak", src: "/logos/bluepeak.svg" },
  { name: "NovaHQ", src: "/logos/novahq.svg" },
  { name: "CityBites", src: "/logos/citybites.svg" },
  { name: "Apex Dental", src: "/logos/apex-dental.svg" },
  { name: "Harbor Hotels", src: "/logos/harbor-hotels.svg" },
];

export async function LogoBar() {
  const t = await getTranslations("marketing.logoBar");

  return (
    <section className="bg-neutral-50 py-8 border-y border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-neutral-500 uppercase tracking-wider font-medium mb-6">
          {t("trustedBy")}
        </p>
      </div>
      <MarqueeLogos logos={LOGOS} speed={35} />
    </section>
  );
}
