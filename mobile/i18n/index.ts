import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { storage } from "./storage";
import en from "./en.json";
import es from "./es.json";

const LANGUAGE_KEY = "app_language";

/**
 * Get saved language or detect from device locale.
 */
function getInitialLanguage(): string {
  const saved = storage.getString(LANGUAGE_KEY);
  if (saved) return saved;

  const deviceLocale = getLocales()[0]?.languageCode ?? "en";
  return deviceLocale === "es" ? "es" : "en";
}

/**
 * Save selected language to persistent storage.
 */
export function setLanguage(lang: string) {
  storage.set(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
}

/**
 * Get current language.
 */
export function getLanguage(): string {
  return i18n.language ?? "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
