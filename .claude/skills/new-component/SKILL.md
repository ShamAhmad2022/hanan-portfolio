---
name: new-component
description: Scaffold a new UI or shared React component using shadcn/ui + Tailwind only. Use when asked to create, add, or build a new React component.
argument-hint: <ComponentName> [ui|shared|forms]
---

You are creating a new React component for the **igotme** project. Use **shadcn/ui + Tailwind only** — no other UI libraries. Component name: **$ARGUMENTS**

> **Scale the ceremony to the component.** The full treatment below (`cva` variants, `data-slot`, `React.ComponentProps`) is for reusable primitives in `components/ui/` and `components/shared/`. A one-off, page-local piece in a route's `_components/` can be a plain function with `Props` + `cn()` — don't force variants and slots onto something used once.

## 1. Placement rules

| Component type | Location | File name |
|---|---|---|
| shadcn/ui primitive (button, input, badge, …) | `src/components/ui/<name>.tsx` | kebab-case |
| Reusable cross-feature component | `src/components/shared/<ComponentName>.tsx` | PascalCase |
| Form-controlled input | `src/components/forms/<ComponentName>.tsx` | PascalCase — see `conventions-patterns` → *Forms* |
| Page-local (used by one route) | that route's `_components/<ComponentName>.tsx` | PascalCase — **not** in `components/` |

- Cross-route components get a barrel export in `src/components/index.ts`. Page-local `_components/` do **not**.
- Prefer `npx shadcn@latest add <name>` when the primitive exists in the registry, then customize. Don't hand-author `ui/` from scratch if the CLI can generate it.

## 2. File header

Add `"use client"` **only** when the component uses React hooks, state, effects, event handlers, or browser APIs. Server Components (pure display) must NOT have it.

```tsx
"use client"; // only if required — omit for pure display components
```

## 3. Imports

```tsx
import { cn } from "@/lib/utils";                          // shadcn cn() — NOT "@/lib/utils/cn"
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";           // compose with existing primitives
import { Icon } from "@iconify/react";                     // icons — <Icon icon={ICONS.close} /> (thin line-art)
import { ICONS } from "@/lib/constants";                   // central icon registry (Phosphor "thin")
```

Allowed deps: `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*` (only via shadcn primitives), `@iconify/react` for icons. **Do NOT use `lucide-react`** — igotme uses `@iconify/react` only.

Disallowed: MUI, Ant, Chakra, Mantine, Base UI, styled-components, emotion, any CSS-in-JS.

## 4. Variant definition (when ≥2 visual variants exist)

```tsx
const componentVariants = cva(
  "inline-flex items-center rounded-lg transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border border-border bg-background hover:bg-muted",
        ghost:   "hover:bg-muted hover:text-foreground",
      },
      size: { sm: "h-7 px-2 text-xs", md: "h-8 px-2.5 text-sm", lg: "h-9 px-3 text-sm" },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);
```

## 5. Props interface

Default to a local `Props` (igotme convention, see `conventions-patterns`). For a reusable `ui/` primitive you may name it `<ComponentName>Props` to export it.

```tsx
interface Props
  extends React.ComponentProps<"div">,
    VariantProps<typeof componentVariants> {
  loading?: boolean;
}
```

Rules:
- **No `React.FC<Props>`** — use a plain function declaration.
- Extend `React.ComponentProps<"element">` (not `HTMLAttributes`) when spreading `...props`.
- Keep `className?: string` so callers can override.
- No `any` — use generics or `unknown`.

## 6. Component body

```tsx
function ComponentName({ className, variant, size, children, ...props }: Props) {
  return (
    <div
      data-slot="component-name"
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

Critical:
- Add `data-slot="<component-name>"` (kebab-case) on the root — shadcn slot-targeting convention.
- Merge `className` through `cn()` **last** so callers can override.
- Spread `{...props}` **after** explicit props.
- No inline styles — Tailwind classes + CSS-variable tokens only (inline `style` only for genuinely dynamic computed values).

## 7. Exports

**Named exports only — never `export default`** (route `page.tsx`/`layout.tsx` are the only default exports in the app).

```tsx
export { ComponentName, componentVariants };
export type { Props as ComponentNameProps };
```

For cross-route components, add to `src/components/index.ts`:
```tsx
export { ComponentName } from "./shared/ComponentName";
```

## 8. Colors, fonts & theming

Semantic CSS-variable tokens only — never hardcode colors. **Palette is strictly grayscale (monochrome — no color accents).** **Light is the default theme**, inverted B&W dark the secondary; tokens make a component work in both with zero edits (see `design-tokens`). Headings use `font-serif`, body/UI `font-sans`. Soft = `rounded-xl`/`2xl` + soft `shadow-sm`. Illustrations use `<Illustration name="…" />` (hand-drawn line-art, `stroke="currentColor"`).

```tsx
// ✅ correct
"bg-background text-foreground border-border"
"bg-card text-muted-foreground rounded-2xl shadow-sm"
"bg-primary text-primary-foreground"   // primary = ink-black — the bold CTA
"bg-secondary / bg-tertiary"           // light-gray tint/surface backgrounds
"font-serif text-2xl"        // headings

// ❌ wrong
"bg-white dark:bg-gray-900"  // hard-coded, not token-based
"text-[#111111]"             // raw hex
"bg-amber-200 text-rose-500" // any hue — monochrome only
```

igotme tokens: surfaces `bg-background` / `bg-card` / `bg-muted`; text `text-foreground` / `text-muted-foreground`; borders `border-border`; status `text-destructive` / `bg-destructive/10`; ink CTA `bg-primary` / `text-primary-foreground`; gray tints `bg-secondary` / `bg-tertiary`. Full list: `stack-dependencies` → *Design tokens (colors)*.

## 9. Animation

Use project Tailwind animations + `tailwindcss-animate`; no custom keyframes inside component files (define them in `tailwind.config.ts`).

Project animations: `animate-swipe`, `animate-rotate`, `animate-changeColor`, `animate-scrollXBig`, `animate-scrollXSmall`. Plus shadcn / `tailwindcss-animate` defaults: `animate-in`, `animate-out`, `fade-in`, `slide-in-from-*`.

## 10. Responsive & RTL

Breakpoints: `mobile:`, `tablet:`, `laptop:`, `desktop:`.

```tsx
"w-full tablet:w-auto laptop:max-w-lg"
```

**RTL:** use Tailwind **logical utilities** that auto-flip with the `dir` attribute — `ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`, `rounded-s`/`rounded-e`. **Not** physical `ml-`/`mr-`/`pl-`/`pr-`/`text-left`, and never `locale === "ar" ? …` branching. Use `rtl:`/`ltr:` variants only for icon/transform flips (`rtl:-scale-x-100`). See `design-tokens` → *RTL*.

## 11. Self-check before finishing

- [ ] Built on shadcn/ui + Tailwind only — no other UI libs; icons via `@iconify/react` (not lucide)
- [ ] Right placement (`ui`/`shared`/`forms`/route `_components`); ceremony scaled to reuse
- [ ] `cn` imported from `@/lib/utils`; `className` merged through `cn()` last
- [ ] `data-slot` on root (for reusable primitives)
- [ ] Named export only; barrel updated if cross-route
- [ ] No hardcoded colors — semantic tokens only
- [ ] `"use client"` only if hooks/state/events used
- [ ] Props extend `React.ComponentProps<"element">` when spreading `...props`; no `React.FC`, no `any`
- [ ] RTL-safe via logical utilities; responsive via project breakpoints
