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

/** Primary nav (the logo links home separately). `key` maps into t.nav. */
export const NAV_LINKS = [
  { key: "work", href: Routs.WORK },
  { key: "about", href: Routs.ABOUT },
  { key: "contact", href: Routs.CONTACT },
] as const;

/** Work filter categories (must match Project.category values). */
export const WORK_CATEGORIES = ["Branding", "UI", "Motion", "Illustration"] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];
