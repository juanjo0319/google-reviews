import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // No locale prefix - keep clean URLs
  localePrefix: "never",
  // Detect locale from cookie
  localeCookie: {
    name: "NEXT_LOCALE",
  },
});

export type Locale = (typeof routing.locales)[number];
