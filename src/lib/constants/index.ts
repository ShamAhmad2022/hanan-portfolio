import { Routs } from "@/lib/enums";

export const SITE = {
  /** Business / studio name — nav logo, footer, browser & SEO title. */
  brand: "TALEEN Creative House",
  /** The person behind the studio — About page + first-person copy. */
  owner: "Hanan",
  role: "Graphic Designer",
  email: "shamahmadaljalam@gmail.com", // TODO: replace with the real address
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Update these hrefs with the real profile URLs. */
export const SOCIALS = [
  { key: "instagram", label: "Instagram", href: "https://instagram.com/" },
  { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/" },
  { key: "email", label: "Email", href: `mailto:${SITE.email}` },
] as const;

/** Show the social links in the header + footer. Hidden for now. */
export const SHOW_SOCIALS = false;

/**
 * Primary nav, shared by the header and footer. `key` maps into t.nav.
 * Contact is hidden for now (still reachable at /contact).
 */
export const NAV_LINKS = [
  { key: "home", href: Routs.HOME },
  { key: "work", href: Routs.WORK },
  { key: "about", href: Routs.ABOUT },
  // { key: "contact", href: Routs.CONTACT }, // hidden for now — reachable at /contact
] as const;

/** Work filter categories (must match Project.category values). */
export const WORK_CATEGORIES = ["Fashion", "Graphics", "Photography", "Events"] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

/**
 * Sub-tags shown as a second filter row, per main category. Only categories
 * listed here get a sub-row; every other category keeps the single row. Values
 * are stable keys — the visible label and blurb live in the dictionaries under
 * `work.subcategoryLabels` / `work.subcategoryDescriptions`, and the per-sample
 * assignment lives in `lib/data/projects.ts`.
 */
export const WORK_SUBCATEGORIES: Partial<Record<WorkCategory, readonly string[]>> = {
  Fashion: ["futoon-factory", "winter-collection", "nasab", "own-collection"],
};

/**
 * Visibility toggles for per-project metadata — all on. The markup lives in
 * `ProjectCard`, the work list filter, and the case-study page; each block is
 * gated by one of these flags rather than being removed. Note the copy in
 * `lib/data/projects.ts` is still placeholder (a small pool cycled across the
 * samples), so titles/clients/tags repeat and year/category are generated.
 * Flip a flag back to `false` to hide that field again until real data exists.
 */
export const SHOW_WORK_META = {
  /** The glass name-label pill layered on top of each card's image. */
  cardImageLabel: false,
  /** Name/title under each card in the work grid (the on-image label is separate). */
  cardTitle: false,
  /** Year/date under each card in the work grid. */
  cardDate: false,
  /** Category label under each card in the work grid. */
  cardCategory: false,
  /** Category filter pills on the work list page. */
  filters: true,
  /** Work title (name) heading on the case-study page. */
  detailTitle: false,
  /** Category label above the title on the case-study page. */
  detailCategory: true,
  /** Description paragraph between the title and the images. */
  detailDescription: false,
  /** Role/year/client/category specs table, between the title and the images. */
  detailSpecs: false,
  /** Tag + link pills below the case-study image gallery. */
  detailTags: false,
  /** Prev/next project names in the case-study footer nav (labels + arrows stay). */
  navProjectName: false,
} as const;

/**
 * Extra full-width gallery shown under the work grid when its category is the
 * active filter. `enabled` is the per-category switch — set it to `false` to
 * hide a gallery without losing its configured images. Add a category block
 * here to give it a gallery; omit one and no section renders for it.
 */
export const ADDITIONAL_GALLERIES: Partial<
  Record<WorkCategory, { enabled: boolean; images: readonly string[] }>
> = {
  Fashion: {
    enabled: true,
    images: ["/work-samples/additional1.jpeg", "/work-samples/additional2.jpeg"],
  },
};
