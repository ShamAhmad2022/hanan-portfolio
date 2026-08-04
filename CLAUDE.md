# Sham — Portfolio

A bilingual (English/Arabic, RTL) **graphic-designer portfolio** for Sham. Structure and feel are
modeled — with the owner's consent — on [klairevandesign.com](https://www.klairevandesign.com); all
content/images are Sham's own. Built on the "igotme" tech stack, re-pointed for a portfolio.

**See `PORTFOLIO-PORT.md`** for how the original `.claude/skills/` (written for the igotme app) map onto
this project (keep / adapt / drop). Those skills are the architectural background; this file + the port
map describe what was actually built.

## Stack (as built)

- **Next.js 16.2** (App Router, **Turbopack** on dev+build), **React 19.2**, **TypeScript** strict.
- **Tailwind CSS v4** — CSS-first `@theme` (there is **no** `tailwind.config.ts`; tokens live in
  `src/app/globals.css`). **shadcn/ui `base-nova` style** → primitives come from **Base UI**
  (`@base-ui/react`), **not Radix**. Icons: **lucide-react** (note: lucide v1 dropped brand icons, so
  Instagram/LinkedIn are inlined SVGs in `SocialLinks`). `cn()` from `@/lib/utils`.
- **Design tokens** (`src/app/globals.css`): CSS variables — `:root` = light (default), `.dark` =
  inverted warm. Warm off-white paper + ink text, with **coral (`--brand`) + blue (`--brand-2`)**
  accents sampled from the reference site. **Provisional** — re-brand by editing `globals.css` only.
  Class-based dark via `@custom-variant dark`. Custom breakpoints `mobile/tablet/laptop/desktop`.
- **Fonts** (`next/font`, swapped per locale in `[locale]/layout.tsx`): Latin = **Inter** (body, `--font-sans`)
  + **Poppins** (headings, `--font-heading`); Arabic = **Cairo** (both). Provisional — swap freely.
- **State:** Redux Toolkit + redux-persist (**UI only** — mobile nav) · **TanStack Query** (only the
  contact mutation). **HTTP:** axios · **forms:** react-hook-form · **toasts:** sonner.
- **i18n:** custom file-based EN/AR via the `[locale]` segment + **`src/proxy.ts`** (Next 16 renamed the
  `middleware` convention to `proxy` — same API). Arabic RTL via `<html dir>` + Base UI
  `DirectionProvider` + Tailwind **logical utilities**.
- **Contact:** `src/app/api/contact/route.ts` → **Resend**. Needs `RESEND_API_KEY` + `CONTACT_TO_EMAIL`
  in `.env.local` (already set to `shamahmadaljalam@gmail.com`); until a key is added the form returns a
  graceful "not configured" error.

## Structure

```
src/
├── app/[locale]/            layout.tsx (root: <html lang/dir>, fonts, Providers, NavBar/Footer)
│   ├── page.tsx             "/" home — hero + featured work grid + contact CTA
│   ├── work/                page.tsx (list + filter) · [slug]/page.tsx (case study)
│   ├── about/ · contact/    page.tsx (+ contact/_components/ContactForm.tsx)
│   └── error.tsx · not-found.tsx
├── app/api/contact/route.ts POST → Resend (server validation, secret server-only)
├── app/sitemap.ts · robots.ts · globals.css
├── components/ui/           shadcn (Base UI) primitives — generated; add via `npx shadcn@latest add`
├── components/shared/       NavBar, Footer, ProjectCard, Logo, SocialLinks, ThemeToggle, LocaleToggle, LoadingSpinner
├── lib/
│   ├── constants/           SITE, SOCIALS, NAV_LINKS, WORK_CATEGORIES
│   ├── data/projects.ts     Project type + sample projects + get*Projects helpers  ← add work here
│   ├── enums/               Routs, Endpoints
│   ├── helpers/             localePath, pickText, categoryLabel
│   ├── hooks/               useLocale, useSubmitContact
│   ├── locales/             i18n.config, dictionaries/{en,ar}, index (getDictionary)
│   ├── providers/Providers  Redux + Query + next-themes + Base UI direction + Toaster
│   └── store/               uiSlice + typed store/hooks
└── proxy.ts                 locale detection + redirect (Next 16 proxy convention)
```

## Conventions

- **Server Components by default**; add `"use client"` only where hooks/state/handlers/browser APIs are
  used (nav, toggles, contact form, work filter).
- Pages read `locale` from **async `params`** (typed `Promise<{ locale: string }>` — the route validator
  rejects a narrowed union) and call `getDictionary(locale)`; client bits use `useLocale()`.
- **Projects** come from `src/lib/data/projects.ts`. Add one = new `Project` entry (bilingual title/desc)
  + images in `public/images/work/<slug>/`, then set `cover`/`images`. A `color` tint shows until a real
  cover is added. `generateStaticParams` + sitemap read from this array.
- Localized text via `pickText()`, category labels via `categoryLabel()`, locale URLs via `localePath()`
  or `useLocale().navigate` — **never** build locale paths by hand.
- **Never hard-code user-facing strings** — add the key to **both** `dictionaries/en.ts` and `ar.ts`.
- Colors/spacing via **tokens** (`bg-background`, `text-brand`, …), never raw hex. **RTL-safe** logical
  utilities (`ms/me/ps/pe/start/end`); `rtl:-scale-x-100` to flip directional icons.

## Commands

```bash
npm run dev     # next dev --turbopack
npm run build   # next build --turbopack
npm run start   # serve the production build
npm run lint    # eslint
```

## To finish / customize

1. **Resend:** add `RESEND_API_KEY` to `.env.local` (verify a domain for a custom "from" address; the
   `onboarding@resend.dev` sender only delivers to the Resend account owner in test mode).
2. **Content:** replace the sample projects, add real images under `public/images/work/<slug>/`, and
   update Sham's bio/specialties in the dictionaries.
3. **Socials:** set the real Instagram/LinkedIn URLs in `src/lib/constants`.
4. **Design:** confirm the exact palette + fonts against the reference site — a one-file edit in
   `globals.css` (colors) / `[locale]/layout.tsx` (fonts).
