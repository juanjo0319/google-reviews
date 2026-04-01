"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/settings", label: "General" },
  { href: "/dashboard/settings/locations", label: "Locations" },
  { href: "/dashboard/settings/brand-voice", label: "Brand Voice" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
  { href: "/dashboard/settings/team", label: "Team" },
  { href: "/dashboard/settings/billing", label: "Billing" },
  { href: "/dashboard/settings/usage", label: "AI Usage" },
];

export function SettingsNav() {
  const pathname = usePathname();

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
