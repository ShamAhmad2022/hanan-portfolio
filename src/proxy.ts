import { NextResponse, type NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import { i18n } from "@/lib/locales/i18n.config";

function getLocale(request: NextRequest): string {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  try {
    return matchLocale(languages, i18n.locales as unknown as string[], i18n.defaultLocale);
  } catch {
    return i18n.defaultLocale;
  }
}

// Next.js 16 renamed the `middleware` convention to `proxy` (same API).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const missingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  if (missingLocale) {
    const locale = getLocale(request);
    const suffix = pathname === "/" ? "" : pathname;
    return NextResponse.redirect(new URL(`/${locale}${suffix}`, request.url));
  }
}

export const config = {
  // Skip API, Next internals, and any file with an extension (static assets).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
