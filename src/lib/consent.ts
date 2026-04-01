const CONSENT_KEY = "revup_cookie_consent";

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean; // always true
};

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setConsent(state: ConsentState): void {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
}

export function hasConsented(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) !== null;
}
