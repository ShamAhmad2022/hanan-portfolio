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

/** Localized blurb for a project category; "all" gets the overview line. */
export function categoryDescription(t: Dictionary, category: string): string {
  if (category === "all") return t.work.allDescription;
  const descriptions = t.work.categoryDescriptions as Record<string, string>;
  return descriptions[category] ?? "";
}

/** Localized label for a category's sub-tag (falls back to the raw key). */
export function subcategoryLabel(t: Dictionary, subcategory: string): string {
  const labels = t.work.subcategoryLabels as Record<string, string | undefined>;
  return labels[subcategory] ?? subcategory;
}

/** Localized blurb for a sub-tag ("" when it has none). */
export function subcategoryDescription(t: Dictionary, subcategory: string): string {
  const descriptions = t.work.subcategoryDescriptions as Record<string, string | undefined>;
  return descriptions[subcategory] ?? "";
}

/** Localized heading for a category's additional gallery ("" when it has none). */
export function additionalGalleryTitle(t: Dictionary, category: string): string {
  const titles = t.work.additionalTitles as Record<string, string | undefined>;
  return titles[category] ?? "";
}
