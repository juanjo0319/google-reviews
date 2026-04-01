"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { hasConsented, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsented()) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setConsent({ analytics: true, marketing: true, necessary: true });
    setVisible(false);
  }

  function handleReject() {
    setConsent({ analytics: false, marketing: false, necessary: true });
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key="cookie-consent"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:max-w-lg"
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
        </m.div>
      )}
    </AnimatePresence>
  );
}
