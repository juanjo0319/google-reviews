"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common.language");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale() {
    const newLocale = locale === "en" ? "es" : "en";

    // Set the cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;

    // Refresh the page to pick up the new locale
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
      aria-label={t("switchTo")}
      title={t("switchTo")}
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{locale === "en" ? "ES" : "EN"}</span>
    </button>
  );
}
