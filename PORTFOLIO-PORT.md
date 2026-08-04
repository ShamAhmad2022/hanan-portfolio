# PORTFOLIO-PORT — adapting the "igotme" blueprint into a graphic-designer portfolio

This file is the **source of truth for the port**. The repo shipped as a blueprint for a different app
("igotme"); this document re-points `CLAUDE.md` + `.claude/skills/` at a **graphic-designer portfolio**,
reusing the **same tech stack**. Read this before editing any skill.

## 1. Project identity

- **Whose site:** a personal portfolio for **Sham** (contact inbox `shamahmadaljalam@gmail.com`).
- **Modeled on (with consent):** **klairevandesign.com** — Klaire Vandegrift's Squarespace portfolio.
- **Copy the *structure & feel*, not the content.** Klaire's bio, project write-ups, images, and exact
  wording are **hers** — use Sham's own text/images. Third-party fonts/stock/icons on Klaire's site do
  **not** transfer; use open/licensed alternatives.

## 2. Locked decisions

1. **Bilingual English + Arabic (RTL)** — keep `[locale]` + middleware + per-locale fonts.
2. **Working contact form** — a real submit that emails Sham (Klaire's own contact page has no form; this
   is a deliberate upgrade).
3. **Projects in a code data file** (typed TS + images in `public/`), no CMS/DB.

## 3. Reference site — structure to mirror

| Area | Klaire's site | Our version |
|------|---------------|-------------|
| Nav | Work (home) · About · Contact + Instagram/LinkedIn | Same, + EN/AR toggle + light/dark |
| Home | Warm personal hero ("Hi! I'm Klaire.") → **work grid** (thumbnails, animated-GIF hover) → footer (©, socials) | Hero (Sham intro) → featured/all work grid (hover state) → contact CTA → footer |
| Work item | Thumbnail → individual **case-study page** | `work/[slug]` case study (cover, gallery, role, year, description) |
| About | Bio (Charlotte-based, "multipotentialite"), specialties (branding & identity, UI, motion), interests, "pixels with meaning" philosophy, headshot | Sham bio + specialties + interests + a philosophy line + headshot |
| Contact | Intro text, email, socials, résumé link — **no form** | Intro + **working form** (name/email/message) + email + socials + optional résumé |
| Platform | Squarespace | Next.js 16 (our stack) |

## 4. Skill porting map

| Skill | Verdict | Notes |
|-------|---------|-------|
| `project-structure` | **Adapt** | Drop `(auth)`/`(app)` groups. Routes under `[locale]/`: `/` (home), `work/` (list) + `work/[slug]/` (case study), `about/`, `contact/`. Keep `src/` layout, `_components/`, thin pages, `components/`+`lib/` layers, middleware. |
| `stack-dependencies` | **Adapt (trim)** | Keep core; drop `@supabase/*`, `@paypal/*`, `@google/genai`. Add contact-email (`resend`). Env: drop domain secrets; add `RESEND_API_KEY`, `CONTACT_TO_EMAIL=shamahmadaljalam@gmail.com`. Optional: `framer-motion` (motion), `embla-carousel-react` (galleries). |
| `design-tokens` | **Adapt (heavy)** | Replace monochrome-journal tokens with the warm-light palette in §5. **Fix the grayscale-vs-beige/rose/sage contradiction.** Keep token architecture (CSS vars→Tailwind), light/dark, RTL table, custom screens. |
| `dynamic-routes` | **Adapt** | Keep `[locale]` + middleware + EN/AR dictionaries + per-locale fonts. `[id]` example → `work/[slug]`; slugs + `generateStaticParams` from the **local projects array**. |
| `conventions-patterns` | **Keep (light edits)** | All patterns stand. Projects import directly from the data module (server components read them); Axios/Query used **only** for the contact `useMutation`. |
| `api-folder` | **Adapt (trim to 1 route)** | Drop external-backend read pipeline. Keep one Route Handler `src/app/api/contact/route.ts` (POST): validate → send email (Resend) → return `{data,status,error}`. Client calls via `useSubmitContact` mutation. |
| `data-model` | **Drop** | No database. |
| `auth-flow` | **Drop** | No accounts. |
| `points-payments` | **Drop** | No monetization. |
| `ai-story-generation` | **Drop** | No AI. |
| `lib-folder` | **Adapt (trim)** | Keep clients/ (slim Axios for contact), constants/, enums/ (`Routs`, `Endpoints.CONTACT`), helpers/, hooks/ (`useLocale`, `useSubmitContact`), locales/ (home/work/about/contact EN+AR), providers/ (Redux + TanStack + next-themes), store/ (small UI slice, e.g. mobile-nav), styles/globals.css, types/ (`Project`, contact types), utils.ts. Drop supabase/paypal/gemini clients. |
| `new-component` | **Keep** | Unchanged. |
| `vercel-react-best-practices` | **Keep as-is** | Generic perf rules. |
| `explain-code` | **Adapt or drop (low priority)** | Repurpose to portfolio or remove. |

## 5. Design tokens (provisional — Klaire-derived, confirm against live site)

Light, warm, minimal, image-forward. Ink text on warm off-white; a playful accent set (coral primary
brand highlight, blue secondary) sampled from Klaire's work. Kept **accessible**: solid CTA buttons use
ink (high contrast), coral used for highlights/links/hover.

| Token | Light value (approx) | Role |
|-------|----------------------|------|
| `--background` | `#FBF9F4` warm off-white | page paper |
| `--foreground` | `#232321` near-black ink | text |
| `--primary` | `#232321` ink | bold CTA buttons (high contrast) |
| `--secondary` | `#F0EEE1` cream | tint/surface |
| `--accent` (brand) | `#E98182` coral | highlights, links, hover, small accents |
| `--accent-2` (brand) | `#3D66B1` blue | secondary accent |
| `--muted` | warm light gray | fills |
| `--radius` | ~`0.75rem` | soft-rounded |

**Fonts (provisional — could NOT extract Klaire's exact faces; swappable in one file):**
- Latin headings: **Poppins** (friendly geometric) · Latin body: **Inter**.
- Arabic (both roles): **Cairo** (geometric, pairs with Poppins).
- Loaded per-locale via `next/font` on `--font-serif`(headings)/`--font-sans`(body) — see `dynamic-routes`.

> ⚠️ Exact palette + fonts should be confirmed visually (connect the Chrome extension or share 2–3
> screenshots). Because everything is CSS-variable tokens in `globals.css` + `tailwind.config.ts`,
> confirming = a one-file edit; it does not affect structure.

## 6. Projects data model

`src/lib/data/projects.ts` — array of `Project`:

```ts
type Project = {
  slug: string;                 // url + folder key
  title: { en: string; ar: string };
  category: string;             // "Branding" | "UI" | "Motion" | ...
  year: number;
  cover: string;                // /images/work/<slug>/cover.jpg
  hover?: string;               // optional GIF for hover (Klaire-style)
  images: string[];             // case-study gallery
  description: { en: string; ar: string };
  role?: string; client?: string; tags?: string[];
  links?: { label: string; url: string }[];
};
```

Helpers: `getAllProjects()`, `getProjectBySlug(slug)`, `getFeaturedProjects()`. Images live in
`public/images/work/<slug>/`.

## 7. Contact form

react-hook-form → `useSubmitContact` (`useMutation`) → `POST /api/contact` → **Resend**
(`onboarding@resend.dev` → `CONTACT_TO_EMAIL`) → sonner toast. Fields: name, email, message (all
required; email validated). Server validates before sending; secret `RESEND_API_KEY` is server-only.
*No-setup fallback if Resend isn't wanted:* Web3Forms/Formspree (access key, no server secret).

## 8. Build order

0. Inspect reference site ✅ (done — findings above).
1. **This file** ✅.
2. Re-point blueprint: rewrite `CLAUDE.md`; delete dropped skills; adapt the rest; update settings.
3. Scaffold (`create-next-app .` in place, shadcn init, trimmed deps, root configs w/ §5 tokens).
4. Build: pages, EN/AR dictionaries, projects data + samples, work grid + case study, contact form +
   `/api/contact`, light/dark toggle, SEO (per-project metadata, sitemap from slugs).

## 9. Verify

`npm run dev` → home/work/`work/[slug]`/about/contact render in `/en` + `/ar`; Arabic is RTL. Contact
submit → email to `CONTACT_TO_EMAIL` + success toast; validation errors show. `npm run build` +
`npm run lint` clean; one static page per project.
