import type { Locale } from "./i18n.config";
import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

/** Server-side dictionary access (e.g. in Server Components / generateMetadata). */
export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale as Locale] ?? en;
}

export type { Dictionary };
