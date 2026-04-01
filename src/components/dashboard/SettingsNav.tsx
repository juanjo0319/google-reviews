"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function SettingsNav() {
  const t = useTranslations("dashboard.settings");
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard/settings", label: t("general") },
    { href: "/dashboard/settings/locations", label: t("locationsTab") },
    { href: "/dashboard/settings/brand-voice", label: t("brandVoice") },
    { href: "/dashboard/settings/notifications", label: t("notifications") },
    { href: "/dashboard/settings/team", label: t("team") },
    { href: "/dashboard/settings/billing", label: t("billing") },
    { href: "/dashboard/settings/usage", label: t("aiUsage") },
  ];

  return (
    <nav className="flex gap-1 border-b border-slate-200 overflow-x-auto">
      {tabs.map(({ href, label }) => {
        const isActive =
          href === "/dashboard/settings"
            ? pathname === "/dashboard/settings"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
