---
name: conventions-patterns
description: The coding style, naming conventions, and reusable patterns shared across this Next.js 16 (Turbopack) + shadcn/ui app — file/folder naming, import aliases & barrels, server vs client components, the thin-page + dynamic-import pattern, data-fetching via hooks, forms with react-hook-form, styling with Tailwind + cn(), Redux slice/selector shape, i18n usage, and memoization. Use this to make new code match the rest of the codebase. The other five skills cover structure; this one covers HOW code is written.
---

# Conventions & patterns

Apply these so new code is indistinguishable from the existing codebase. The other skills say *what goes where*; this says *how it's written*.

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Route folders | kebab-case | `forgot-password/`, `problems/`, `points/` |
| Component files | PascalCase `.tsx` | `CharacterCustomizer.tsx`, `StoryInteraction.tsx`, `LoginForm.tsx` |
| Non-component files (hooks/utils/config) | camelCase | `useLocale.tsx`, `dateManipulators.ts`, `i18n.config.ts` |
| Hooks | `use` + PascalCase | `useGetProblems`, `useWindowSize`, `useInfiniteScrollFetch` |
| Data hooks | `useGet<Resource>` / `useGet<Resource>Details` | `useGetProblems`, `useGetProblemDetails` |
| Enums & members | PascalCase enum, `UPPER_SNAKE` members | `Endpoints.GET_PROBLEMS`, `Routs.CHARACTER` |
| Redux selectors | `select<Slice>` | `selectApp`, `selectPoints` |
| Redux actions | `set<Field>` | `setPointsBalance` |
| Props type | local `Props` (or `type Props = {…}`) | `interface Props { … }` |
| Translation objects | `<feature>EN` / `<feature>AR` | `landingEN`, `charactersAR` |

Folder of page-local components is `_components/` (leading underscore). The route-enum is named `Routs`; the example code throughout these skills uses that spelling. Keep one spelling **consistent** everywhere — if you prefer `Routes`, rename it in every reference, not piecemeal.

## Imports

- **Always use the `@/` alias** for cross-folder imports: `@/lib/hooks`, `@/components`, `@/components/shared/LoadingSpinner`. The alias points at `src/` (`@/* → ./src/*`), so it only reaches code inside `src/`. Relative imports only for close siblings. ⚠️ `@/public/...` does **not** resolve (public is at the repo root, outside `src/`) — see the styling note below.
- **Bare-specifier ambient types**: resource types are imported by bare module name, not path — `import { Problem } from "problems"`, `import { ItemResponse } from "backend"` (these come from `src/lib/types/*.d.ts` `declare module` blocks).
- **Barrels**: import the public surface from the folder's `index`, not deep files — `@/lib/constants`, `@/lib/enums`, `@/lib/types`, `@/lib/hooks`, `@/components`. Add new public exports to the barrel.
  - ⚠️ **Client-bundle caveat.** Barrels can pull unused modules into a **client** bundle and hurt tree-shaking (`vercel-react-best-practices` → `bundle-barrel-imports`). Reconciliation: barrels stay the default for **server/lib code, types, constants, enums, and hooks** (no client-bundle cost); but when a **Client Component** needs one heavy widget from a large barrel, **deep-import it** (`@/components/shared/HeavyThing`) rather than the barrel. For barrel-heavy **third-party** packages, use `optimizePackageImports` in `next.config.ts` (see `stack-dependencies`). Rationale logged in `DECISIONS.md`.
- **`cn` (shadcn)** comes from `@/lib/utils`.

## Server vs client components

- **Default = Server Component.** `page.tsx`, `layout.tsx` stay server unless they need interactivity.
- **`"use client"`** is the first line of any file using hooks, state, effects, event handlers, or browser APIs — all of `lib/hooks/helpers/*`, `lib/providers/*`, form components, and most `_components/*`.
- **`error.tsx`** is always a Client Component.
- Data-fetching is done **client-side** through TanStack Query hooks (not in Server Components) — matching the existing architecture. (For Next 16 server data, `await params` first; see `dynamic-routes`.)

## The thin-page + dynamic-import pattern

Route `page.tsx` files contain almost no logic — they `dynamic()`-import the real component (which lives in `_components/`) with a `LoadingSpinner` fallback:

```tsx
const CharacterPage = dynamic(() => import("@/app/[locale]/(app)/character/_components/CharacterCustomizer"), {
  loading: () => <LoadingSpinner />,
});
export default function Page() { return <CharacterPage />; }
```

This keeps route files trivial, code-splits each page, and gives every page a loading state for free. The same pattern wraps `NavBar`/`Footer` in the root layout. Reuse it for every new page.

## Data fetching

Components **never** call Axios or `fetch` directly — they call a hook from `src/lib/hooks/data/`:

```tsx
const { data, isLoading } = useGetProblems();          // list (infinite)
const { data } = useGetProblemDetails(id);             // detail (one story/problem)
```

The hook reads `locale` from `useLocale()`, instantiates `AxiosClient`, and wraps `useQuery`/`useInfiniteQuery`. Query defaults (set in `TanStackProvider`): `refetchOnWindowFocus: false`, `staleTime: 24h`, `retry: false`. Paginated lists pair with `useInfiniteScrollFetch` for scroll-triggered `fetchNextPage`. (Full hook anatomy in `lib-folder`; pipeline in `api-folder`.)

## Forms (react-hook-form + Controller)

Inputs are controlled via `Controller`, wrapping a UI primitive, exposing `control` + `name`:

```tsx
export const TextInput: React.FC<Props> = ({ control, name, label, ...rest }) => (
  <Controller control={control} name={name}
    render={({ field, fieldState: { error } }) => (
      <div className="flex flex-col gap-1">
        {label && <Label htmlFor={name}>{label}</Label>}
        <Input id={name} aria-invalid={!!error} {...field} {...rest} />
        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>
    )} />
);
```

Reusable inputs live in `components/forms/` (`TextInput`, `SelectInput`). Pattern: take `control` + `name`, render a `Controller`, and surface `fieldState.error`. Build on shadcn's `<Input>` / `<Label>` (or the `<Form*>` primitives) from `components/ui/`; keep the `Controller` + `control`/`name` API consistently — or adopt shadcn's `<Form>` + `useForm` wrappers throughout.

## Styling

- **Tailwind utility-first**, with the custom responsive prefixes `mobile:`, `tablet:`, `laptop:`, `desktop:` (from `tailwind.config.ts` `screens`).
- **Token-based colors, never raw hex in components. The palette is strictly grayscale (monochrome — no color accents).** `primary` is ink-black (the bold CTA — `bg-primary` / `text-primary-foreground`); `secondary`/`tertiary` are light grays for tint/surface backgrounds; surfaces use shadcn tokens (`bg-background`, `text-foreground`, `border-border`). All map to CSS variables defined once in `globals.css` (see `stack-dependencies` → *Design tokens (colors)*), so the palette is swappable from one place. **Light is the default theme** (off-white paper + ink); an inverted B&W dark is the optional secondary (`darkMode: "class"`).
- **`cn()`** (from `@/lib/utils`) to merge conditional classes; **inline `style`** only for dynamic values (computed filters/transforms).
- **RTL**: the root layout sets the **`dir` attribute** on `<html>` from `locale`. Use Tailwind **logical utilities** that flip automatically — `ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`, `rounded-s`/`rounded-e` — **not** physical `ml-`/`pl-`/`text-left`, and never `locale === "ar" ? …` branching. Reach for `rtl:`/`ltr:` variants only when no logical utility exists (icon/transform flips). Full table + examples: `design-tokens` → *RTL*.
- **Images** via `next/image` (`<Image>`). With the `src/` layout, reference files in `public/` by **root-relative URL string** — `<Image src="/svg/logo.svg" width={…} height={…} alt="…" />` — not by `@/public/...` import (the alias points into `src/` and won't reach `public/`). If you need an asset as a **module import** (e.g. an SVG-as-component or a static import object), keep it in `src/assets/` and import via `@/assets/...`. Remote hosts must be whitelisted in `next.config.ts`.

## Dark / light mode

Colors are **token-based** (Tailwind classes → CSS variables in `globals.css`), which makes the UI theme-swappable and easy to re-brand. Current stance and how to use it:

- **Light is the default theme** (off-white paper + ink); an **inverted B&W dark** (near-black paper + off-white ink) is the optional secondary. **Both palettes are already defined** in `globals.css` (`:root` = light, `.dark` = dark — see `stack-dependencies` → *Design tokens (colors)*). Build with the semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `bg-card`, `border-border`) — **not** hard-coded shades like `bg-white` or `text-black` — so both themes work with zero component edits.
- **To wire the toggle:**
  1. `npm i next-themes`; wrap the app in its `<ThemeProvider attribute="class" defaultTheme="light">` inside `lib/providers/providers.tsx` (see `lib-folder`).
  2. The root layout already styles `<html>` with token classes (`bg-background text-foreground`), so it follows the active theme automatically — no change needed there.
  3. Add a toggle button calling `setTheme("light" | "dark")` from `next-themes`.

> The monochrome palette (ink-black `primary`, light-gray `secondary`/`tertiary`, off-white paper) and the serif/sans font pairing live as CSS variables, so re-tuning the look is an edit to `globals.css` only.

## Redux slice pattern

```ts
export interface InitialAppStateProps { isMobileNavDrawerOpen: boolean; }
const initialState: InitialAppStateProps = { isMobileNavDrawerOpen: false };
export const appSlice = createSlice({
  name: "app", initialState,
  reducers: {
    setIsMobileNavDrawerOpen: (state, { payload }: StorePayload<boolean>) => {
      state.isMobileNavDrawerOpen = payload;       // Immer — mutate directly
    },
  },
});
export const { setIsMobileNavDrawerOpen } = appSlice.actions;
export const selectApp = (state: { app: InitialAppStateProps }) => state.app;
```

Every slice: typed `InitialXStateProps`, `initialState`, `set*` reducers taking `{ payload }: StorePayload<T>` (shared type from `@/lib/types`), exported actions, and a `select*` selector. Register it in `reducers.ts` with its own `persistReducer` (empty `whitelist` until you want it persisted). Use Redux for **UI/client** state only; server data belongs in TanStack Query.

## i18n in components

```tsx
const { t, locale, navigate } = useLocale();
<SharedText>{t.problems.continue}</SharedText>
<Button onClick={() => navigate({ href: Routs.PROBLEM_DETAILS, replacements: { ID: problem.id } })} />
```

Never hard-code user-facing strings — read from `t.<feature>.<key>` and add the key to both `…EN`/`…AR` dictionaries. Never build locale URLs by hand — use `navigate(...)`/`toggleLocale()`.

## Performance & misc

- **`React.memo`** list items / cards / expensive renders (`const ProblemCard = React.memo(({ problem }: Props) => …)`).
- **`useMemo`/`useState`** for local UI state (hover, open flags) — not Redux.
- **Named exports** for utilities, hooks, and shared components (barrels re-export them); **default export** for route `page.tsx`/`layout.tsx`, the Axios client, and single-purpose provider/slice-adjacent modules — match the file's existing style.
- **Skeletons**: each major page has a matching skeleton in `components/skeletons/`; use it as the `dynamic()` `loading` fallback where a tailored skeleton exists (else `LoadingSpinner`).
- **`dynamic()` with `loading`** is the standard code-split + loading pattern across pages and heavy components.

## Quick checklist for any new feature

1. Route folder kebab-case under `src/app/[locale]/`; thin `page.tsx` `dynamic()`-importing a `_components/` Client Component.
2. Types → `src/lib/types/<feature>.d.ts` (`declare module`); endpoint → `src/lib/enums`; data hook → `src/lib/hooks/data/<feature>.ts`.
3. Strings → `src/lib/locales/data/<feature>.ts` (EN+AR); read via `useLocale().t`.
4. UI from `src/components/ui/` (shadcn) + `cn()`; semantic color tokens + the type/spacing scale (`design-tokens`); RTL-safe via logical utilities; `next/image` (URL strings for `public/`).
5. UI state → a Redux slice (typed, `select*`, registered in `reducers.ts`); server state → TanStack Query.
6. `React.memo` lists/cards; barrel-export anything shared; `"use client"` wherever hooks/state/handlers are used.
