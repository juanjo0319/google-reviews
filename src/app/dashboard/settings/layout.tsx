import { SettingsNav } from "@/components/dashboard/SettingsNav";
import { getTranslations } from "next-intl/server";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("dashboard.settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("subtitle")}
        </p>
      </div>
      <SettingsNav />
      {children}
    </div>
  );
}
