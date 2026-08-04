"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, type Locale } from "@/lib/locales/i18n.config";
import { dictionaries } from "@/lib/locales";

/**
 * Client-side i18n glue. Reads the active locale from the URL and exposes the
 * dictionary plus locale-aware navigation helpers. Components never parse the
 * path themselves or build locale URLs by hand.
 */
export function useLocale() {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/");
  const candidate = segments[1] as Locale;
  const locale: Locale = (i18n.locales as readonly string[]).includes(candidate)
    ? candidate
    : i18n.defaultLocale;

  const t = dictionaries[locale];
  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";

  /** Prefix an app-relative href with the active locale. */
  const localize = (href: string) => {
    const clean = href.startsWith("/") ? href : `/${href}`;
    return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
  };

  /** Push a route, optionally replacing placeholders like `SLUG`. */
  const navigate = (href: string, replacements?: Record<string, string>) => {
    let target = href;
    if (replacements) {
      for (const [key, value] of Object.entries(replacements)) {
        target = target.replace(key, value);
      }
    }
    router.push(localize(target));
  };

  /** Swap to the other locale, preserving the current path. */
  const toggleLocale = () => {
    const other: Locale = locale === "ar" ? "en" : "ar";
    const rest = segments.slice(2).join("/");
    router.push(`/${other}${rest ? `/${rest}` : ""}`);
  };

  return { locale, t, dir, localize, navigate, toggleLocale };
}
