---
name: design-tokens
description: igotme's visual system — color tokens, typography scale, spacing & component sizing, dark/light theming, and RTL rules. Use when styling, theming, or fixing visual issues. The values here are sensible best-practice defaults; they're centralized so they're easy to change later.
---

# Design tokens & visual system

igotme's visual language: a **minimalist black-and-white aesthetic** — editorial, breathable, hand-crafted (a high-end monochrome journal / graphic novel), built on **Tailwind + shadcn tokens**, **light theme by default** (inverted B&W dark optional). Everything below is chosen for a calm, narrative, consumer-facing self-help app (spacious and intentional, **not** a dense admin dashboard). All values are centralized — change them in one place and the whole UI follows.

## Colors

Colors are **CSS variables** defined once in `src/lib/styles/globals.css` and consumed through Tailwind tokens — never a raw hex in a component. **Strictly grayscale (monochrome) — no color accents.** Light by default: `background` off-white paper, `foreground` deep near-black ink. `primary` is the **ink (near-black)** so the main CTA reads as a bold black button; `secondary` `#E6E6E6`-ish and `tertiary` are **light grays** used as tint/surface backgrounds; `destructive` is a dark gray (no red — meaning is carried by label/icon). Use `bg-background` / `text-foreground`, `bg-card`, `bg-primary` / `text-primary-foreground` (the black CTA), `bg-secondary`, `bg-tertiary`, `text-muted-foreground`, `border-border`. `accent`/`muted` stay **neutral** (hovers/fills). Where hue alone used to signal state (e.g. problem status), differentiate by **fill vs outline vs weight**, not color.

> Full token list, HSL format, and the Tailwind mapping live in `stack-dependencies` → *Design tokens (colors)*. Dark/light theming steps are below and in `conventions-patterns` → *Dark / light mode*.

## Typography scale

**Two families:** a soft **semi-serif for headings** (`font-serif` — Fraunces) and a **clean sans for body** (`font-sans` — Inter). This pairing carries the cozy-diary feel. Use Tailwind's **named sizes** (not arbitrary `text-[13px]`). Body is **16px (`text-base`)** — readability matters for long stories and letters.

| Use case | Class | ~Size | Family / weight |
|---|---|---|---|
| Hero / landing headline | `font-serif text-4xl` → `laptop:text-5xl` | 36–48px | serif, `font-semibold` |
| Page title (h1) | `font-serif text-3xl` | 30px | serif, `font-semibold` |
| Section heading (h2) | `font-serif text-2xl` | 24px | serif, `font-medium` |
| Subsection (h3) | `font-serif text-xl` | 20px | serif, `font-medium` |
| Lead / intro paragraph | `text-lg` | 18px | sans, `font-normal` |
| Body (default) | `text-base` | 16px | sans, `font-normal` |
| Secondary / captions | `text-sm text-muted-foreground` | 14px | sans, `font-normal` |
| Labels / hints / badges | `text-xs` | 12px | sans, `font-medium` |

Rules: **headings use `font-serif`**, body/UI use `font-sans` (the default). Cozy serifs read better a touch lighter — favor `font-medium`/`font-semibold` over `font-bold`. Secondary text uses the `text-muted-foreground` **token**, never a hard-coded `text-gray-400`. Story/letter body should be `text-base`/`text-lg` with relaxed leading (`leading-relaxed`). Both families are loaded **per locale** via `next/font` (Latin vs Arabic, swapped on `--font-sans` / `--font-serif`) — see `dynamic-routes` → *Per-locale fonts*; give Arabic slightly looser line-height.

## Spacing & component sizing

Stick to Tailwind's spacing scale (4px steps); step responsive sizes with the custom screens (`mobile`/`tablet`/`laptop`/`desktop`).

| Thing | Default | ~Value |
|---|---|---|
| Page horizontal padding | `px-4` → `tablet:px-6` → `laptop:px-8` | 16/24/32px |
| Reading content width | `max-w-2xl` (text-heavy) / `max-w-5xl` (wide) | 672 / 1024px |
| Section vertical rhythm | `py-12` → `laptop:py-16` | 48 / 64px |
| Card padding | `p-5` / `p-6` | 20 / 24px |
| Stacked gap (forms, lists) | `gap-3` / `gap-4` | 12 / 16px |
| Inline gap (icon + text) | `gap-2` | 8px |
| Buttons | shadcn `<Button>` sizes (`default`/`sm`/`lg`) | — |
| Border radius | `rounded-xl` default · `rounded-2xl` cards · `rounded-full` pills | 12 / 16px (cozy, soft) |
| Separation | **soft `shadow-sm`** + a hairline `border-border` | gentle elevation is part of the cozy look |
| Elevation | `shadow-sm` cards · `shadow-md` modals/popovers | soft and warm, never hard/black |

Soft + roomy = **rounded + soft shadows + generous whitespace**. Lean roomier (`rounded-xl`/`2xl`, soft shadows, ample padding) rather than tight/flat. Reading-heavy pages (the story interaction, the personal letter) should **cap line length** with `max-w-2xl` (~60–75 characters per line). **Illustrations:** hand-drawn **line-art** (thin, expressive, sketch-like strokes — never filled or colored). Use the `<Illustration name="…" />` component (`src/components/static/Illustration.tsx`): inline SVGs with `fill="none"` + `stroke="currentColor"`, so they stay monochrome and adapt to light/dark/RTL via the container's text color. Placed with generous whitespace — decorative, low-contrast, never competing with text. The shipped drawings are **placeholders**; final art swaps in by editing that one component.

## Dark / light theming

**Light is the default theme** (off-white paper + ink-black); an **inverted B&W dark** (near-black paper + off-white ink) is the optional secondary — both palettes are already defined in `globals.css` (`:root` = light, `.dark` = dark; see `stack-dependencies` → *Design tokens (colors)*). Always style with **semantic tokens** (`bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `border-border`) — **never** `bg-white`, `bg-[#fafafa]`, or `text-black` — so both themes work with zero per-component edits.

To enable the toggle: add `next-themes` `<ThemeProvider attribute="class" defaultTheme="light">` in `providers.tsx`, then a toggle button. Full steps: `conventions-patterns` → *Dark / light mode*.

## RTL

igotme is bilingual (`en` LTR / `ar` RTL). The root layout sets the **`dir` attribute** on `<html>` from the locale (`dir={locale === "ar" ? "rtl" : "ltr"}`). Tailwind's logical utilities key off that attribute, so prefer them — they **flip automatically**, with no `locale` branching and no duplicate classes:

| Physical (avoid) | Logical (use) |
|---|---|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |
| `border-l` / `border-r` | `border-s` / `border-e` |

```tsx
// ✅ auto-flips in Arabic — no branching
<div className="ms-3 ps-4 text-start rounded-s-lg border-s">

// ❌ stuck in one direction
<div className="ml-3 pl-4 text-left">
```

Use `rtl:` / `ltr:` variants **only** when no logical utility exists — e.g. flipping a directional icon or a transform:

```tsx
<Icon icon="mdi:chevron-right" className="rtl:-scale-x-100" /> // points the other way in Arabic
```

Symmetric/vertical utilities (`mt-`, `mb-`, `px-`, `py-`, `gap-`, `w-`, `h-`) need no flipping. **Never** use the old `locale === "ar" ? "text-right" : "text-left"` branching — logical utilities replace it.

## Self-check (before committing UI)

- [ ] No hard-coded hex/named colors — using tokens (`bg-primary`, `text-foreground`, `text-muted-foreground`)? Palette stays **grayscale** — no hue introduced?
- [ ] Works in **both** light (default) and dark — semantic tokens, not `bg-white` / `text-black` / `bg-[#hex]`?
- [ ] Headings use `font-serif`; body/UI use `font-sans`; sizes from the scale — no arbitrary `text-[13px]`?
- [ ] Spacing from the Tailwind scale; generous whitespace; reading width capped (`max-w-2xl`) on text-heavy pages?
- [ ] Directional spacing uses logical utilities (`ms`/`me`/`ps`/`pe`/`start`/`end`), not `ml`/`mr`/`pl`/`pr`?
- [ ] Cozy feel: `rounded-xl`/`2xl` + **soft** `shadow-sm`/`md`, not flat/tight/hard-shadowed?
