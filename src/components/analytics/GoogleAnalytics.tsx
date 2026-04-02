"use client";

import { useState, useEffect } from "react";
import { getConsent } from "@/lib/consent";

export function GoogleAnalytics() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    function checkConsent() {
      const consent = getConsent();
      setHasAnalyticsConsent(consent?.analytics === true);
    }

    checkConsent();

    // Listen for consent changes from CookieConsent component
    window.addEventListener("consent-updated", checkConsent);
    return () => window.removeEventListener("consent-updated", checkConsent);
  }, []);

  if (!hasAnalyticsConsent) return null;
  if (process.env.NODE_ENV === "development") return null;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  // Lazy-load the GA component only after consent
  return <LazyGA gaId={gaId} />;
}

function LazyGA({ gaId }: { gaId: string }) {
  const [GA, setGA] = useState<React.ComponentType<{ gaId: string }> | null>(null);

  useEffect(() => {
    import("@next/third-parties/google").then((mod) => {
      setGA(() => mod.GoogleAnalytics);
    });
  }, []);

  if (!GA) return null;
  return <GA gaId={gaId} />;
}
