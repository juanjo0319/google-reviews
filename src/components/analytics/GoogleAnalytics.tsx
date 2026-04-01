"use client";

import { GoogleAnalytics as GA } from "@next/third-parties/google";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV === "development") return null;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return <GA gaId={gaId} />;
}
