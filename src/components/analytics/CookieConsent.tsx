"use client";

import { useState, useEffect } from "react";
import { hasConsented, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!hasConsented()) {
      setVisible(true);
      // Small delay so the CSS transition animates in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMounted(true);
        });
      });
    }
  }, []);

  function handleAccept() {
    setConsent({ analytics: true, marketing: true, necessary: true });
    window.dispatchEvent(new Event("consent-updated"));
    setMounted(false);
    setTimeout(() => setVisible(false), 300);
  }

  function handleReject() {
    setConsent({ analytics: false, marketing: false, necessary: true });
    window.dispatchEvent(new Event("consent-updated"));
    setMounted(false);
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:max-w-lg transition-all duration-300 ease-out"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(100px)",
      }}
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <p className="text-sm text-gray-600">
          We use cookies to analyze site usage and improve your experience.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleAccept}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Accept All
          </button>
          <button
            onClick={handleReject}
            className="text-sm text-gray-500 underline-offset-2 transition-colors hover:text-gray-700 hover:underline"
          >
            Reject Non-Essential
          </button>
        </div>
      </div>
    </div>
  );
}
