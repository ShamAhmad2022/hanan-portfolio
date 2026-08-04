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
export const WORK_CATEGORIES = ["Branding", "UI", "Motion", "Illustration"] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

/**
 * Temporary visibility toggles. The sample items in `lib/data/projects.ts` use
 * placeholder metadata until Hanan supplies the real content per piece, so we
 * hide (not remove) that dummy metadata for now. Flip a flag back to `true`
 * once its real data exists — the markup is kept, just gated by these flags.
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
  filters: false,
  /** Case-study text info: category label, description, specs block, tags/links. */
  detailInfo: false,
  /** Work title (name) heading on the case-study page. */
  detailTitle: false,
  /** Prev/next project names in the case-study footer nav (labels + arrows stay). */
  navProjectName: false,
} as const;
