---
name: dynamic-routes
description: Recreate the dynamic routing + i18n of this Next.js 16 (Turbopack) App Router site — the top-level [locale] segment, locale-detection middleware, the i18n config + file-based dictionaries, [id] detail routes, route groups, private _components folders, and the thin dynamic()-imported page pattern. Use when setting up routing/localization. Includes the Next.js 16 async params rules. Read project-structure for the tree and lib-folder for the i18n/hooks internals.
---

# Dynamic routing & i18n

This site has **two kinds of dynamic segments** and a custom, library-free i18n:

- `app/[locale]/…` — the outer segment that localizes **every** page (`en` | `ar`).
- `…/[id]/page.tsx` — inner detail segments for data-driven resources.

Locale is chosen by **`src/middleware.ts`** and threaded through the app by the `useLocale` hook. There is no `next-intl`/`next-i18next`; dictionaries are TS objects in `src/lib/locales/`.

## 1. The `[locale]` segment

Everything lives under `src/app/[locale]/`. There is no un-localized page, so URLs are always `/{locale}/…` (`/en`, `/ar/problems/new`, …). The root layout consumes the locale:

```tsx
// src/app/[locale]/layout.tsx  (Server Component)
export default async function RootLayout({
  children,
  params: { locale },                         // ⚠️ see Next 16 async-params note below
}: Readonly<{ children: React.ReactNode; params: { locale: Locale } }>) {
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="bg-background text-foreground">
      <body>
        <Providers>
          <SideNav /><NavBar />
          <main role="main"><div className="w-full h-[88px]" />{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

The layout: sets `<html lang>` and the **`dir` attribute** (`rtl` for Arabic — Tailwind's logical utilities key off this so they auto-flip), styles with semantic tokens (`bg-background text-foreground`), mounts the `Providers` stack once, and `dynamic()`-imports `NavBar`/`Footer` with a `LoadingSpinner` fallback. `export const metadata = appMetadata`. (RTL utility rules: `design-tokens` → *RTL*.)

> ⚠️ **Next.js 16 — `params` is async.** In Next 16, `params` and `searchParams` are `Promise`s. Update the signature and `await`:
> ```tsx
> export default async function RootLayout(
>   { children, params }: { children: React.ReactNode; params: Promise<{ locale: Locale }> }) {
>   const { locale } = await params;
>   // …
> }
> ```
> Same for `page.tsx` Server Components, `generateMetadata`, and `generateStaticParams`. **Client Components** instead read params synchronously via `useParams()` (no await).

### Per-locale fonts (`next/font`)

Two needs combine here: **two roles** (a semi-serif for headings + a sans for body, the cozy pairing — see `design-tokens`) and **two scripts** (Latin vs Arabic). Load each role with `next/font`, expose it through a stable CSS variable (`--font-serif` headings, `--font-sans` body), and pick the Latin-vs-Arabic face by locale — so only the active locale's fonts ship per request:

```tsx
// src/app/[locale]/layout.tsx
import { Inter, Fraunces, Noto_Kufi_Arabic, Noto_Naskh_Arabic } from "next/font/google";

// body (sans)                                           // headings (semi-serif)
const sansLatin  = Inter({ subsets: ["latin"], variable: "--font-sans",  display: "swap" });
const serifLatin = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sansAr  = Noto_Kufi_Arabic({ subsets: ["arabic"], variable: "--font-sans",  display: "swap" });
const serifAr = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-serif", display: "swap" });

export default async function RootLayout({ children, params }: …) {
  const { locale } = await params;
  const sans  = locale === "ar" ? sansAr  : sansLatin;
  const serif = locale === "ar" ? serifAr : serifLatin;
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}
          className={`${sans.variable} ${serif.variable} bg-background text-foreground`}>
      <body className="font-sans">{/* Providers, children, … */}</body>
    </html>
  );
}
```

Then point Tailwind's families at the variables (see `stack-dependencies`), so `font-sans` (default, body) and `font-serif` (headings) resolve to the active locale's faces:

```ts
// tailwind.config.ts → theme.extend.fontFamily
fontFamily: {
  sans:  ["var(--font-sans)",  "system-ui", "sans-serif"],
  serif: ["var(--font-serif)", "Georgia",   "serif"],
}
```

Why this shape: each role reuses a **stable variable** (`--font-sans` / `--font-serif`) across locales, so swapping the Latin-vs-Arabic faces per locale is all it takes — no conditional class names on every element, and only the active locale's fonts load. Provisional picks: **Fraunces** (cozy semi-serif headings) + **Inter** (body); Arabic uses Noto Naskh/Kufi — swap any of these as the design settles. Arabic generally wants a slightly looser `leading` (see `design-tokens` → *Typography scale*). `display: "swap"` avoids invisible text while the font loads.

## 2. `src/middleware.ts` (locale detection)

Sits **inside `src/`**, sibling to `app/` (never inside `app/`). With a `src/` directory Next.js requires `middleware.ts` to live in `src/`, not the repo root. It redirects any locale-less URL to a detected locale:

```ts
import { i18n } from "@/lib/locales/i18n.config";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const missing = i18n.locales.every(
    (l) => !pathname.startsWith(`/${l}/`) && pathname !== `/${l}`);
  if (missing) {
    const locale = getLocale(request);                 // Negotiator + matchLocale(Accept-Language)
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
```

- `getLocale` builds a headers map, reads `Accept-Language` via `Negotiator().languages()`, and picks the best match against `i18n.locales` (falling back to `i18n.defaultLocale`).
- The `matcher` **excludes** `api`, `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`, `sitemap.xml` — so assets and (future) API routes are never locale-redirected.

## 3. i18n config & dictionaries (`lib/locales/`)

```ts
// lib/locales/i18n.config.ts
export const i18n = { defaultLocale: "en", locales: ["en", "ar"], localDetection: true } as const;
```

`as const` makes the literal types flow: `type Locale = (typeof i18n)["locales"][number]` (`"en" | "ar"`, in `lib/types/app.ts`). Dictionaries are TS objects: `lib/locales/data/<feature>.ts` exports `<feature>EN`/`<feature>AR`; `en.ts`/`ar.ts` aggregate them and default-export one object per locale. (See `lib-folder` for the full i18n structure.)

## 4. The `useLocale` hook (client-side glue)

Client components never parse the path themselves — they call `useLocale()` (`lib/hooks/helpers/useLocale.tsx`):

```ts
const { locale, t, navigate, toggleLocale, currentRout } = useLocale();
```

- `locale` — read from `usePathname()` segment 1.
- `t` — the active dictionary (`t.home.title`, …).
- `navigate({ href: Routs.PROBLEM_DETAILS, replacements: { ID: id } })` — replaces `ID` then `router.push("/" + join(locale, href))`, keeping the user in their locale.
- `toggleLocale()` — rewrites path segment 1 to the other locale and pushes.

## 5. `[id]` detail routes (list + detail pattern)

A data-driven resource folder pairs an entry/list page with a dynamic detail (instance) page. In igotme the **character interactive page** is exactly this — one story/problem instance addressed by `[id]`:

```
problems/
├── new/page.tsx      # entry → renders <ProblemInput/>      ("/problems/new")
├── [id]/page.tsx     # detail → renders <StoryInteraction/> ("/problems/{id}")
└── _components/       # ProblemInput.tsx, StoryInteraction.tsx
```

**Pages are thin** — they only `dynamic()`-import the real client component with a spinner fallback:

```tsx
// src/app/[locale]/(app)/problems/[id]/page.tsx
const StoryInteractionPage = dynamic(() => import("@/app/[locale]/(app)/problems/_components/StoryInteraction"), {
  loading: () => <LoadingSpinner />,
});
export default function Page() { return <StoryInteractionPage />; }
```

The `_components/StoryInteraction` (a Client Component) reads the id from the route via `useParams()` and fetches with the resource hook (`useGetProblem(id)`). The `id` is propagated into the endpoint by `Endpoints.GET_PROBLEM_DETAILS.replace("ID", id)`.

> Because the detail page delegates to a client component that uses `useParams()`, it sidesteps the async-`params` change entirely. If you instead read the id in the **server** `page.tsx`, use `const { id } = await params;` (Next 16).

## 6. Route groups & private folders (recap)

- **Route groups** `(auth)`, `(app)` — parentheses → not in the URL; they set the auth boundary (each with its own session-aware `layout.tsx`). Also usable for organizing shared section components (nav/footer).
- **Private folders** `_components/` — leading underscore → not routable; per-route components live here. Use `_components/` consistently.
- **Static detail routes** (e.g. `terms/page.tsx`) — plain nested folders for a fixed, known item set, instead of `[id]`.

## Recreation checklist

1. `src/lib/locales/i18n.config.ts` (with `as const`) + `src/lib/types/app.ts` `Locale`.
2. `src/middleware.ts` (Negotiator + intl-localematcher, matcher excluding assets/api).
3. `src/app/[locale]/layout.tsx` setting `lang` + `dir` and mounting `Providers` — using **async `params`** for Next 16.
4. `src/lib/locales/data/*` dictionaries + `en.ts`/`ar.ts`, and the `useLocale` hook.
5. For each data resource (e.g. `problems/[id]`): a thin `[id]/page.tsx` `dynamic()` wrapper, with logic in `_components/` Client Components using `useParams()` + the resource hook.
6. Use route groups (`(auth)`, `(app)`) for auth boundaries / section grouping, and `_components/` for page-local components.

> **igotme note:** if the app ships in one language, you can drop `[locale]` and the middleware — but the list+detail, route-group, private-folder, and thin-`dynamic()`-page patterns still apply (e.g. `problems/`, `problems/[id]/`, `characters/[id]/`). Keep them.
