import type { Locale } from "@/lib/locales/i18n.config";
import type { Dictionary } from "@/lib/locales";

/** Build a locale-prefixed app path (server-safe; the client uses useLocale). */
export function localePath(locale: Locale | string, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Pick the right side of a localized text object. */
export function pickText(text: { en: string; ar: string }, locale: Locale | string): string {
  return locale === "ar" ? text.ar : text.en;
}

/** Localized label for a project category (falls back to the raw value). */
export function categoryLabel(t: Dictionary, category: string): string {
  const labels = t.work.categoryLabels as Record<string, string>;
  return labels[category] ?? category;
}
