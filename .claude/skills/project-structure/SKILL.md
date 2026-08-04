---
name: project-structure
description: Scaffold the top-level folder layout and App Router skeleton of a multilingual, frontend-only Next.js 16 (Turbopack) site styled with shadcn/ui. Use when starting a new project that must mirror this architecture — the src/ application root (app/, components/, lib/, middleware under src/; public/ and configs at the repo root), the [locale] App Router tree, route groups, private _components folders, the components/ (incl. shadcn ui/) layer, the lib/ utility layer, public assets, and the locale middleware. This is the map; sibling skills (lib-folder, api-folder, dynamic-routes, stack-dependencies, conventions-patterns) fill in each area.
---

# Project Structure

This skill is the **map of the whole project**. It documents the overall folder layout and how to recreate it from scratch in a **Next.js 16 project using the Turbopack bundler and shadcn/ui**. It deliberately stays at the "what exists and what each thing is for" level — the internals of each area are covered by the sibling skills:

- `lib-folder` — everything under `lib/`
- `api-folder` — how data access is structured (this app has no `app/api`; it calls an external backend)
- `dynamic-routes` — the `[locale]` / `[id]` routing and i18n middleware
- `stack-dependencies` — exact dependencies and config file contents
- `conventions-patterns` — naming, styling, component, and data-fetching patterns

Recreate the structure described here first, then use the sibling skills to fill in each part.

## What kind of app this is

- **Next.js 16, App Router** (no Pages Router), **Turbopack** bundler (`next dev/build --turbopack`).
- **`src/` directory.** All application code — `app/`, `components/`, `lib/`, and `middleware.ts` — lives under `src/`. `public/` and every config file stay at the project root. The `@/` import alias points at `src/` (`@/* → ./src/*`), so `@/lib/…`, `@/components/…` resolve into `src/`. ⚠️ One consequence: `@/public/…` no longer resolves (public is outside `src/`) — reference public assets by root-relative URL (`/svg/logo.svg`) or keep importable assets in `src/assets/`.
- **Bilingual (English / Arabic)** via a custom, file-based i18n system. Every page lives under a dynamic `app/[locale]/` segment; the locale is detected and injected by `src/middleware.ts`. Arabic renders RTL.
- **Frontend-only.** There are **no** `app/api` route handlers. All data comes from an external REST backend consumed through a typed Axios client (`lib/clients/axios/client.ts`). See `api-folder`.
- **UI built with shadcn/ui.** Radix-based primitives are generated into `components/ui/` by the shadcn CLI and styled with Tailwind CSS + a local `cn()` helper (`lib/utils.ts`). There is **no** runtime component-library provider.
- **State:** Redux Toolkit + redux-persist for UI/client state; TanStack React Query for server state.

## Top-level layout

Recreate this tree. **Application code lives under `src/`; `public/` and all config files stay at the root:**

```
<project-root>/
├── src/                      # ALL application code lives here
│   ├── app/                  # Next.js App Router — every route lives under [locale]/
│   ├── components/           # Cross-route reusable components
│   │   └── ui/               # shadcn/ui generated primitives (button, input, dialog, …)
│   ├── lib/                  # All non-UI app code (clients, constants, enums, helpers,
│   │                         #   hooks, locales/i18n, providers, store, styles, types, utils.ts)
│   ├── middleware.ts         # Locale detection + redirect — inside src/, never inside app/
│   └── assets/               # (optional) images/SVGs imported as modules via @/assets/…
├── public/                   # Static assets — STAYS at root (svg/, images/, GIFs/, clients/, favicon, robots, sitemap)
├── components.json           # shadcn/ui CLI config (style, RSC, tailwind paths, aliases)
├── next.config.ts            # Typed Next config (images.remotePatterns, …)
├── tsconfig.json             # Strict TS, moduleResolution "bundler", @/* → ./src/* path alias
├── tailwind.config.ts        # Custom screens/colors/animations + shadcn design tokens
├── postcss.config.mjs        # Tailwind (+ autoprefixer) via PostCSS
├── eslint.config.mjs         # Flat ESLint config (next/core-web-vitals + TS)
├── .prettierrc               # Formatting rules
├── next-env.d.ts             # Next-generated TS declarations (do not edit)
├── .env.local                # NEXT_PUBLIC_* runtime config (not committed)
├── Makefile                  # Convenience targets: dev / build / lint / acp
├── package.json
└── README.md
```

### Top-level folder & file purposes

| Path              | Purpose |
|-------------------|---------|
| `src/`            | All application code. Holds `app/`, `components/`, `lib/`, and `middleware.ts`. The `@/` alias resolves here. |
| `src/app/`        | App Router routes, layouts, pages. Everything nests under `[locale]/`. |
| `src/components/` | Cross-route reusable components: `ui/` (shadcn primitives), `shared/`, `static/`, `forms/`, `skeletons/`, `demos/`, plus a barrel `index.ts`. Page-specific components do **not** go here — they live in each route's `_components/`. |
| `src/lib/`        | All non-component logic. Subfolders: `clients/`, `constants/`, `enums/`, `helpers/`, `hooks/`, `locales/`, `providers/`, `store/`, `styles/`, `types/`, plus `utils.ts` (the shadcn `cn` helper). See `lib-folder`. |
| `src/middleware.ts` | Runs on every non-asset request; redirects locale-less URLs to `/{locale}/…`. Lives in `src/` (required when using a `src/` dir). See `dynamic-routes`. |
| `public/`         | Static files served from `/`: SVG logos/icons, raster images, GIFs, client logos, `favicon.ico`, `robots.txt`, `sitemap.xml`. **Stays at the project root, not under `src/`.** |
| `components.json` | shadcn/ui config, created by `npx shadcn@latest init`. Declares style, RSC flag, Tailwind config/CSS paths, and import aliases (`@/components`, `@/lib/utils`). |
| `next.config.ts`  | Typed Next.js configuration. Holds `images.remotePatterns` for remote image hosts. |
| `Makefile`        | Shortcut targets that wrap the npm scripts (dev/build/lint, and an `acp` add-commit-push). |

## The `src/app/` directory (App Router tree)

Every route is nested inside the dynamic `[locale]` segment — there is no un-localized page. Recreate this structure (under `src/`):

```
src/app/
└── [locale]/                       # dynamic locale segment ("en" | "ar")
    ├── layout.tsx                  # Root layout: <html lang>, dir=ltr/rtl, wraps <Providers>
    ├── page.tsx                    # Landing page ("/") — public marketing/intro
    ├── error.tsx                   # Error boundary for the locale subtree (Client Component)
    │
    ├── (auth)/                     # ROUTE GROUP — unauthenticated auth flows (no URL segment)
    │   ├── layout.tsx              # shared centered auth shell; redirects to /character if already signed in
    │   ├── login/
    │   │   ├── page.tsx            # "/login"
    │   │   └── _components/
    │   │       └── LoginForm.tsx
    │   ├── signup/
    │   │   ├── page.tsx            # "/signup"
    │   │   └── _components/
    │   │       └── SignupForm.tsx
    │   └── forgot-password/
    │       ├── page.tsx            # "/forgot-password"
    │       └── _components/
    │           └── ForgotPasswordForm.tsx
    │
    └── (app)/                      # ROUTE GROUP — authenticated app (no URL segment)
        ├── layout.tsx             # app shell (nav + points balance); GUARDS the Supabase session
        │
        ├── character/             # Character customization page
        │   ├── page.tsx           # "/character"
        │   └── _components/
        │       └── CharacterCustomizer.tsx
        │
        ├── problems/
        │   ├── new/               # Problem input page (free users capped at 3 active problems)
        │   │   ├── page.tsx       # "/problems/new"
        │   │   └── _components/
        │   │       └── ProblemInput.tsx
        │   └── [id]/              # Character interactive page — one story/problem instance
        │       ├── page.tsx       # "/problems/{id}" — read the story, interact, submit the solution
        │       └── _components/
        │           └── StoryInteraction.tsx
        │
        └── points/                # Points purchase page (PayPal checkout)
            ├── page.tsx           # "/points"
            └── _components/
                └── PointsPurchase.tsx
```

> Route names are kebab-case; the `(auth)`/`(app)` group folders set the auth boundary without adding a URL segment (`/login`, not `/auth/login`). Shared section components (nav, footer, points-balance widget) can live in their own route group (e.g. a `(nav)`/`(footer)` pair) or in `src/components/shared/`.

### App Router conventions used (and how to apply them)

- **`[locale]` wraps everything.** No page exists outside it. The root `layout.tsx` reads `locale` from `params`, sets `<html lang={locale}>`, and sets text direction (`ltr` for `en`, `rtl` for `ar`). *(If igotme ships single-language, drop `[locale]` and the middleware — see note at the end.)*
- **Route groups `(auth)`, `(app)`.** Parentheses mean the folder name does **not** appear in the URL. Here they split the app into an unauthenticated zone and a session-guarded zone, each with its own `layout.tsx`. (Also use groups — e.g. a `(nav)`/`(footer)` pair — to organize shared section components without creating routes.)
- **Auth gating lives in a group `layout.tsx`.** `(app)/layout.tsx` checks the Supabase session and redirects to `/login` when absent; `(auth)/layout.tsx` bounces already-signed-in users into the app. Keep the guard in the layout, not in every page.
- **Private folders `_components/`.** A leading underscore opts a folder out of routing. Each route keeps its page-specific components here. Use `_components/` consistently (never a plain `components/`).
- **File roles:** `page.tsx` = the routable page (Server Component by default); `layout.tsx` = shared shell; `error.tsx` = error boundary (Client Component). Add `loading.tsx` / `not-found.tsx` per route as needed.
- **List + detail pattern:** a resource folder has `page.tsx` (list) and `[id]/page.tsx` (detail). igotme's `problems/[id]` is the detail/instance page — it delegates to a client component in `_components/` (`StoryInteraction`) that reads the id (via `useParams()`) and fetches the story with a TanStack Query hook. Add a `problems/page.tsx` list later if you want a "my problems" overview (the 3-active-problems limit makes this natural).
- **Static detail routes** are plain nested folders (no `[id]`), used when the item set is fixed/known — e.g. legal pages like `terms/` or `privacy-policy/` if you add them.

> ⚠️ **Next.js 16 note:** `params` and `searchParams` are **async** — typed as `Promise<…>` and must be `await`ed in Server Components, layouts, `generateMetadata`, `generateStaticParams`, etc. Client Components still read route params synchronously via the `useParams()` hook. Code samples are in the `dynamic-routes` skill.

## The `src/components/` directory

Cross-route components only (page-local ones live in each route's `_components/`):

```
src/components/
├── ui/             # shadcn/ui primitives GENERATED by the CLI (button.tsx, input.tsx,
│                   #   dialog.tsx, select.tsx, …). Do NOT hand-author this folder —
│                   #   run `npx shadcn@latest add <component>`. cn() comes from @/lib/utils.
├── shared/         # Larger reusable widgets (cards, modals, spinners, animations)
├── static/         # Presentational wrappers (buttons, SharedImage, SharedText, links, video)
├── forms/          # Form inputs wired to react-hook-form (TextInput, SelectInput)
├── skeletons/      # Loading-skeleton components, one per major page
├── demos/          # Self-contained feature demos (e.g. OCR/)
└── index.ts        # Barrel re-exporting commonly used components
```

shadcn primitives in `ui/` are the styling foundation; `static/`, `shared/`, and `forms/` build on top of them. Styling and `cn()` conventions are in `conventions-patterns`; the shadcn install flow is in `stack-dependencies`.

## The `public/` directory

```
public/
├── favicon.ico
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── svg/                    # logos + UI/social icons (SVG)
├── images/                 # product art, placeholders (PNG; often *-mobile variants)
├── GIFs/                   # animated assets
└── clients/                # client logos (SVG/PNG)
```

`public/` stays at the **project root** (not under `src/`). Remote images (from the external backend / object storage) are **not** stored here — they are loaded via `next/image` and whitelisted in `next.config.ts` under `images.remotePatterns`.

> ⚠️ **`src/` + `public/` import caveat.** With the `src/` layout the `@/` alias points at `src/`, so module imports like `import Logo from "@/public/svg/logo.svg"` **do not resolve** (public is outside `src/`). Two fixes: (a) reference public files by root-relative **URL string** — `<Image src="/svg/logo.svg" … />` — which needs no import; or (b) put assets you want to import as modules in `src/assets/` and import via `@/assets/…`.

## Root configuration files (what each is for)

| File | What to put in it |
|------|-------------------|
| `next.config.ts` | Typed config exporting `NextConfig`. Set `images.remotePatterns` for backend/object-storage host(s). Turbopack is the default bundler in Next 16. |
| `tsconfig.json` | `strict: true`, `moduleResolution: "bundler"`, `jsx: "preserve"`, `paths: { "@/*": ["./src/*"] }` (alias points into `src/`). |
| `tailwind.config.ts` | Custom `screens` (`mobile 412px`, `tablet 820px`, `laptop 1240px`, `desktop 1500px`), brand `colors`, keyframes/animations, **plus shadcn CSS-variable design tokens** (`background`, `foreground`, `primary`, `border`, …) and `tailwindcss-animate`. |
| `postcss.config.mjs` | Tailwind (and autoprefixer) as PostCSS plugins. |
| `eslint.config.mjs` | Flat config extending `next/core-web-vitals` + TypeScript rules. |
| `.prettierrc` | printWidth 100, 2-space tabs, double quotes, semicolons, trailing commas `all`, LF. |
| `components.json` | shadcn CLI config (style, RSC flag, Tailwind config + CSS paths, aliases). |
| `.env.local` | `NEXT_PUBLIC_FRONTEND_DOMAIN`, `NEXT_PUBLIC_BACKEND_DOMAIN`. |

Exact dependency versions and full config contents are in `stack-dependencies`.

## `src/middleware.ts`

Lives **inside `src/`** (sibling to `app/`, never inside `app/` itself). When a project uses a `src/` directory, Next.js requires `middleware.ts` to be in `src/`, not the project root. Responsibilities:

1. Inspect `request.nextUrl.pathname`.
2. If the path is missing a supported locale prefix, negotiate the best locale from the `Accept-Language` header (`negotiator` + `@formatjs/intl-localematcher`) against the configured locales (`@/lib/locales/i18n.config.ts`).
3. `NextResponse.redirect` to `/{locale}{pathname}`.
4. A `config.matcher` excludes `api`, `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`, and `sitemap.xml`.

Full middleware code and the i18n config are in `dynamic-routes`.

## Recreation checklist

1. `npx create-next-app@latest` — App Router, TypeScript, Tailwind, ESLint, the `@/*` alias, **with a `src/` dir** (`--src-dir`), and Turbopack. This puts `app/` under `src/` and sets `paths: { "@/*": ["./src/*"] }`.
2. Set the npm scripts to use `--turbopack` (see `stack-dependencies`).
3. `npx shadcn@latest init` → creates `components.json`, `src/lib/utils.ts` (`cn`), and the shadcn design tokens in Tailwind/CSS.
4. Create `src/app/[locale]/` with `layout.tsx`, `page.tsx`, `error.tsx`.
5. Add `src/middleware.ts` + `src/lib/locales/i18n.config.ts` for locale routing.
6. Create the `src/components/` subfolders — `ui/` via `npx shadcn@latest add …`, plus `shared/`, `static/`, `forms/`, `skeletons/`, `demos/`, and `index.ts`.
7. Build out `src/lib/` per the `lib-folder` skill.
8. Add the route folders under `src/app/[locale]/`: the `(auth)` group (`login`, `signup`, `forgot-password`) and the `(app)` group (`character`, `problems/new`, `problems/[id]`, `points`), each with a thin `page.tsx` + `_components/`. Put the session guard in each group's `layout.tsx`.
9. Populate `public/` (at the repo root) and configure `images.remotePatterns` in `next.config.ts`.

This establishes the skeleton. Proceed to the area-specific sibling skills to fill in each part.
