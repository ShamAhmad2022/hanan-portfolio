---
name: stack-dependencies
description: The tech stack, dependencies, npm scripts, and root config files for this app — Next.js 16 with the Turbopack bundler and shadcn/ui. Use when scaffolding the project, choosing package versions, or writing next.config / tsconfig / tailwind.config / postcss / eslint / prettier / components.json. Read project-structure for the file map; this skill has the exact contents.
---

# Stack & dependencies

This documents what to install and how to configure it for a **Next.js 16 + Turbopack + shadcn/ui** build.

## Stack at a glance

| Area | Choice |
|------|--------|
| Framework | **Next.js 16.x** (App Router) |
| React | **19.x** (Next 16 baseline) |
| Bundler | **Turbopack** (`--turbopack` on dev+build) |
| UI library | **shadcn/ui** (generated `components/ui/`, Radix + Tailwind, **no runtime provider**) |
| `cn()` helper | `clsx` + `tailwind-merge` in `lib/utils.ts` (via shadcn) |
| Styling | Tailwind v3.4 (or v4 if you opt in) + `tailwindcss-animate` + shadcn tokens |
| Config formats | `next.config.ts`, flat `eslint.config.mjs` |
| State / data | Redux Toolkit, redux-persist, TanStack Query |
| HTTP / forms / UX | Axios, react-hook-form, sonner, Iconify (`@iconify/react`) |
| i18n | Negotiator, intl-localematcher |

## npm scripts (Turbopack)

```jsonc
{
  "scripts": {
    "dev":   "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint":  "next lint"
  }
}
```

## Dependencies to install

**Core app:**
- State/data: `@reduxjs/toolkit`, `react-redux`, `redux-persist`, `@tanstack/react-query`
- HTTP: `axios`
- Forms: `react-hook-form`
- i18n: `negotiator`, `@formatjs/intl-localematcher` (+ `@types/negotiator`)
- UX: `sonner` (toasts), `@iconify/react` (icons — Iconify)
- Utils: `use-debounce`
- Media (only if needed): `react-player`; 3D (`three`, `@react-three/fiber`, `@react-three/drei`, `@splinetool/react-spline`) — **add only if igotme needs 3D**

**Framework + UI:**
- `next@latest` (16), `react@latest`, `react-dom@latest`
- shadcn toolchain: `clsx`, `tailwind-merge`, `tailwindcss-animate`, `class-variance-authority` (added automatically by `npx shadcn@latest init` / `add`)

**igotme-specific (domain services):**
- `@supabase/supabase-js` + `@supabase/ssr` (auth + DB, browser & server clients)
- `@paypal/react-paypal-js` (client) and/or PayPal REST calls server-side
- `@google/genai` (Gemini Flash — AI story generation & premium features, server-only)

**devDependencies:** `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`, plus the TS-ESLint plugins.

## Initialize the project

Scaffold **in place** at the repo root so `package.json`, `src/`, and the config files sit at the **same level as `CLAUDE.md`, `DECISIONS.md`, and `.claude/`** (not in a nested subfolder). Pass `.` as the project name — do **not** name it `igotme` (that would create a `igotme/` subdirectory):

```bash
# run from the repo root (same dir as CLAUDE.md / .claude/)
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
npx shadcn@latest init           # creates components.json, src/lib/utils.ts (cn), CSS tokens
npx shadcn@latest add button input dialog select # add primitives as needed → src/components/ui/
```

> ⚠️ **Non-empty directory.** `create-next-app .` expects an essentially empty folder. It ignores hidden dot-folders like `.git` and **`.claude/`** (so the skills are safe), but the visible `CLAUDE.md` and `DECISIONS.md` may still trigger a "directory not empty" prompt. If it complains, temporarily move `CLAUDE.md` + `DECISIONS.md` out, scaffold, then move them back — or scaffold into a temp subfolder and move the generated files up. Don't delete them (and leave `.claude/` in place).

`--src-dir` puts `app/`, `components/`, `lib/`, and `middleware.ts` under `src/` (cleaner root); `public/` and config files stay at the repo root. `--import-alias "@/*"` sets the alias — with `--src-dir` it resolves to `./src/*`. ⚠️ Because the alias points into `src/`, `@/public/…` module imports won't resolve — reference public files by URL string (`/svg/x.svg`) or put importable assets in `src/assets/`.

## Root config files

### `next.config.ts` (typed)
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "<your-object-storage-host>", pathname: "**" }] },
  // Tree-shake barrel exports from heavy third-party packages into per-module imports.
  // Next optimizes many common packages by default; add barrel-heavy libs you adopt here.
  experimental: { optimizePackageImports: [/* e.g. a barrel-heavy icon/UI lib */] },
};
export default nextConfig;
```
Add a `remotePatterns` entry for every remote image host (e.g. your Supabase Storage / CDN host). Turbopack is the default — no bundler config needed. `optimizePackageImports` is the third-party side of the **barrel-imports reconciliation** (`conventions-patterns` → Imports): it keeps barrel ergonomics for external packages without shipping their whole index to the client. Rationale logged in `DECISIONS.md`.

### `tsconfig.json`
Strict, bundler resolution, `@/*` alias pointing into `src/`:
```jsonc
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true, "noEmit": true, "esModuleInterop": true,
    "module": "esnext", "moduleResolution": "bundler",
    "resolveJsonModule": true, "isolatedModules": true,
    "jsx": "preserve", "incremental": true, "skipLibCheck": true, "allowJs": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`
A custom design system **plus** shadcn tokens + `tailwindcss-animate`:
- `content`: `["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"]`.
- `darkMode: "class"` — **light is the default theme** (`:root`); `.dark` is the optional warm-dark override (toggled via `next-themes`).
- `theme.extend.screens`: `{ mobile: "412px", tablet: "820px", laptop: "1240px", desktop: "1500px" }` (matches `SCREENS` in `lib/constants/app.ts`).
- `theme.extend.colors` / `borderRadius` / `fontFamily`: map every color, the radius, and the two font families to **CSS variables** via `hsl(var(--…))` / `var(--…)` so the whole look is swappable from one place (see *Design tokens (colors)* below). The palette is **strictly grayscale** (monochrome): `primary` (ink black — the bold CTA) / `secondary` / `tertiary` (light grays used as tint/surface backgrounds); shadcn tokens (`background`, `foreground`, `card`, `muted`, `border`, `ring`, …); fonts `serif` (headings) / `sans` (body).
- `theme.extend.keyframes`/`animation`: custom ones (`swipe`, `rotate`, `changeColor`, `scrollXBig/Small`).
- `plugins`: `require("tailwindcss-animate")`; plus custom `addUtilities` plugins (`.line-clamp-3`, `.animation-paused/running`).

### Design tokens (colors) — single source of truth

**Aesthetic: a minimalist black-and-white journal** — editorial, breathable, hand-crafted (a high-end monochrome journal / graphic novel). **Strictly grayscale — no color accents.** Light is the default theme (off-white paper + ink-black); an inverted B&W dark (near-black paper + off-white ink) is the optional secondary. Colors are defined **once** as HSL CSS variables (saturation `0%`) in `src/lib/styles/globals.css`, and Tailwind references them. To re-brand, edit only these variables — every `bg-primary` / `text-secondary` updates automatically. Note **`primary` is the ink (near-black)** so the main CTA reads as a bold black button; `secondary`/`tertiary` are light grays used as tint/surface backgrounds.

```css
/* src/lib/styles/globals.css */
:root {                                /* LIGHT — default (off-white paper + ink) */
  --background: 0 0% 98%;              /* off-white paper */
  --foreground: 0 0% 10%;             /* deep near-black ink */
  --card: 0 0% 100%;                   /* pure white — gently lifted surface */
  --card-foreground: 0 0% 10%;
  --muted: 0 0% 95%;                  /* soft gray fill */
  --muted-foreground: 0 0% 42%;       /* mid gray */
  --border: 0 0% 88%;                 /* hairline soft gray */
  --input: 0 0% 88%;
  --ring: 0 0% 45%;                   /* neutral focus ring */
  --primary: 0 0% 12%;                /* ink black — bold CTA */
  --primary-foreground: 0 0% 98%;     /* white on black */
  --secondary: 0 0% 90%;              /* light gray surface */
  --secondary-foreground: 0 0% 15%;
  --tertiary: 0 0% 82%;               /* mid-light gray */
  --tertiary-foreground: 0 0% 15%;
  --accent: 0 0% 95%;                 /* neutral hover/highlight (NOT a brand color) */
  --accent-foreground: 0 0% 12%;
  --destructive: 0 0% 20%;            /* dark gray — no red; meaning via label/icon */
  --destructive-foreground: 0 0% 98%;
  --radius: 0.75rem;                   /* rounded-xl default (cozy, soft) */
}
.dark {                                /* inverted B&W — optional secondary theme */
  --background: 0 0% 8%;               /* near-black paper */
  --foreground: 0 0% 95%;             /* off-white ink */
  --card: 0 0% 11%;
  --card-foreground: 0 0% 95%;
  --muted: 0 0% 16%;
  --muted-foreground: 0 0% 62%;
  --border: 0 0% 20%;
  --input: 0 0% 20%;
  --ring: 0 0% 60%;
  --primary: 0 0% 95%;                /* white ink — bold inverted CTA */
  --primary-foreground: 0 0% 10%;
  --secondary: 0 0% 22%;
  --secondary-foreground: 0 0% 92%;
  --tertiary: 0 0% 28%;
  --tertiary-foreground: 0 0% 92%;
  --accent: 0 0% 16%;
  --accent-foreground: 0 0% 95%;
  --destructive: 0 0% 30%;
  --destructive-foreground: 0 0% 95%;
}
```

```ts
// tailwind.config.ts → theme.extend
colors: {
  background: "hsl(var(--background))",  foreground: "hsl(var(--foreground))",
  card:    { DEFAULT: "hsl(var(--card))",    foreground: "hsl(var(--card-foreground))" },
  muted:   { DEFAULT: "hsl(var(--muted))",   foreground: "hsl(var(--muted-foreground))" },
  primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
  secondary:{ DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
  tertiary: { DEFAULT: "hsl(var(--tertiary))",  foreground: "hsl(var(--tertiary-foreground))" },
  accent:  { DEFAULT: "hsl(var(--accent))",  foreground: "hsl(var(--accent-foreground))" },
  destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
  border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
},
borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 4px)", sm: "calc(var(--radius) - 8px)" },
fontFamily: {
  sans:  ["var(--font-sans)",  "system-ui", "sans-serif"],   // body — Inter / Noto Kufi (Arabic)
  serif: ["var(--font-serif)", "Georgia",   "serif"],        // headings — Fraunces (soft semi-serif)
},
```

Use as `bg-background text-foreground`, `bg-card`, `bg-primary text-primary-foreground`, `bg-secondary`, `bg-tertiary`, `border-border`, `font-serif` (headings) / `font-sans` (body) — never hard-code a hex. **Three brand accents:** `primary` (warm beige) is the calm base/main CTA; `secondary` (dusty rose) is the warm emotional accent; `tertiary` (sage green) is the grounding/natural accent that echoes the plant illustrations and doubles as the **positive/active/resolved** status hue. `accent`/`muted` stay **neutral** (component hovers/fills) — don't repurpose them as brand colors. ⚠️ shadcn stores colors as **HSL channels without the `hsl()` wrapper** (`36 54% 76%`, not `hsl(36 54% 76%)`); the wrapper lives in the Tailwind mapping. The palette + fonts are **provisional** — centralized here, so re-tuning is a one-place edit. Fonts are loaded in `dynamic-routes` → *Per-locale fonts*; the design scale is in `design-tokens`.

### `postcss.config.mjs`
```js
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
```

### `eslint.config.mjs` (flat config — Next 16)
Flat config extending `next/core-web-vitals` + TypeScript rules. Add relaxed rules as needed (e.g. `react/display-name: off`, `react-hooks/rules-of-hooks: off`) in the flat format.

### `.prettierrc`
```jsonc
{ "printWidth": 100, "tabWidth": 2, "singleQuote": false, "semi": true,
  "trailingComma": "all", "arrowParens": "always", "endOfLine": "lf",
  "overrides": [{ "files": "*.{js,jsx,tsx,ts,scss,json,html}", "options": { "tabWidth": 4 } }] }
```

### `components.json` (shadcn)
Generated by `shadcn init`. Confirm aliases point at `@/components` and `@/lib/utils`, `rsc: true`, `tsx: true`, and the Tailwind config + global CSS paths are correct.

### `.env.local`
- Public: `NEXT_PUBLIC_FRONTEND_DOMAIN`, `NEXT_PUBLIC_BACKEND_DOMAIN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe).
- **Server-only** (no `NEXT_PUBLIC_` prefix): `SUPABASE_SERVICE_ROLE_KEY`, `PAYPAL_CLIENT_ID`/`PAYPAL_SECRET`, `GEMINI_API_KEY` — see `api-folder`.

### `Makefile` (optional)
Thin wrappers over the npm scripts (`dev`, `build`, `lint`) plus an `acp` add-commit-push target.

## Recreation checklist

1. `create-next-app .` (in place at the repo root, **not** a named subfolder) with `--app --typescript --tailwind --eslint --src-dir --import-alias "@/*" --turbopack` (alias resolves to `./src/*`).
2. Add `--turbopack` to `dev` and `build` scripts.
3. `shadcn init`, then `shadcn add` primitives into `src/components/ui/`.
4. Write the seven root configs above (typed `next.config.ts`, `tsconfig`, `tailwind.config.ts` with brand+shadcn tokens, `postcss`, flat eslint, `.prettierrc`, `components.json`).
5. Install core deps (RTK, redux-persist, react-query, axios, react-hook-form, negotiator, intl-localematcher, sonner, `@iconify/react`) + domain deps (supabase, paypal, gemini).
6. Populate `.env.local`; whitelist remote image hosts in `next.config.ts`.

(See `conventions-patterns` for how these tools are used in code, and `lib-folder` for the provider/store/i18n wiring.)
