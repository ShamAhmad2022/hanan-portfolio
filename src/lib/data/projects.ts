import { WORK_CATEGORIES } from "@/lib/constants";

export type LocalizedText = { en: string; ar: string };

export interface Project {
  slug: string;
  title: LocalizedText;
  category: string; // one of WORK_CATEGORIES
  year: number;
  featured?: boolean;
  /** Placeholder tint used until a real cover image is added. */
  color: string;
  /** Optional real cover image — /images/work/<slug>/cover.jpg. Falls back to `color`. */
  cover?: string;
  /** Optional GIF/hover image for the grid (Klaire-style hover state). */
  hover?: string;
  /** Case-study gallery images (root-relative /images/... paths). */
  images: string[];
  description: LocalizedText;
  role?: LocalizedText;
  client?: string;
  tags?: string[];
  links?: { label: string; url: string }[];
}

/**
 * Dummy copy reused across the sample cards until real per-project content
 * exists. Each field is bilingual; the generator below cycles this pool across
 * the 30 uploaded images in `public/work-samples/`.
 */
type BaseProject = Pick<
  Project,
  "title" | "color" | "description" | "role" | "client" | "tags"
>;

const BASE_PROJECTS: BaseProject[] = [
  {
    title: { en: "Aurora — Brand Identity", ar: "أورورا — الهوية البصرية" },
    color: "#e98182",
    description: {
      en: "A warm, editorial identity for a boutique studio — logotype, palette, and a flexible layout system.",
      ar: "هوية دافئة وتحريرية لأستوديو صغير — شعار نصّي ولوحة ألوان ونظام تخطيط مرن.",
    },
    role: { en: "Brand & identity", ar: "الهوية والعلامة" },
    client: "Aurora Studio",
    tags: ["Logo", "Palette", "Guidelines"],
  },
  {
    title: { en: "Meadow — Mobile App UI", ar: "ميدو — واجهة تطبيق" },
    color: "#3d66b1",
    description: {
      en: "Product design for a calm habit-tracking app: onboarding, home, and a gentle progress system.",
      ar: "تصميم منتج لتطبيق هادئ لتتبّع العادات: التهيئة والرئيسية ونظام تقدّم لطيف.",
    },
    role: { en: "Product / UI design", ar: "تصميم المنتج والواجهة" },
    client: "Meadow",
    tags: ["Mobile", "Design system", "Prototype"],
  },
  {
    title: { en: "Pulse — Motion Reel", ar: "بَلس — ريل موشن" },
    color: "#f5b960",
    description: {
      en: "A short title-sequence and set of animated brand moments exploring rhythm and type in motion.",
      ar: "تتابع عناوين قصير ومجموعة لحظات علامة متحرّكة تستكشف الإيقاع والخط في الحركة.",
    },
    role: { en: "Motion design", ar: "تصميم الموشن" },
    tags: ["After Effects", "Type in motion"],
  },
  {
    title: { en: "Harvest — Packaging", ar: "هارفست — التغليف" },
    color: "#e6c9a3",
    description: {
      en: "Packaging and label system for a small-batch pantry line — tactile, honest, and shelf-ready.",
      ar: "نظام تغليف وملصقات لخط مؤن بكميّات صغيرة — ملموس وصادق وجاهز للرفّ.",
    },
    role: { en: "Packaging design", ar: "تصميم التغليف" },
    client: "Harvest Co.",
    tags: ["Packaging", "Illustration"],
  },
  {
    title: { en: "Atlas — Pitch Deck", ar: "أطلس — عرض تقديمي" },
    color: "#6a87c2",
    description: {
      en: "An investor deck redesign: a clear narrative, data visualisation, and a confident type system.",
      ar: "إعادة تصميم عرض للمستثمرين: سرد واضح وتصوير للبيانات ونظام خطوط واثق.",
    },
    role: { en: "Layout & data viz", ar: "التخطيط وتصوير البيانات" },
    client: "Atlas",
    tags: ["Presentation", "Data viz"],
  },
  {
    title: { en: "Bloom — Illustration Set", ar: "بلوم — مجموعة رسوم" },
    color: "#eaa3a4",
    description: {
      en: "A hand-drawn illustration set used across social, print, and a small campaign landing page.",
      ar: "مجموعة رسوم مرسومة يدويًا استُخدمت في السوشال والطباعة وصفحة حملة صغيرة.",
    },
    role: { en: "Illustration", ar: "الرسم" },
    tags: ["Illustration", "Campaign"],
  },
];

/**
 * The portfolio pieces — currently 30 sample cards, one per image in
 * `public/work-samples/`. Each card uses a sample image as its `cover`; the
 * surrounding text is dummy (cycled from BASE_PROJECTS) until real per-project
 * content exists. `category` cycles through WORK_CATEGORIES so the /work filter
 * stays meaningful. Everything (grid, detail page, sitemap, static params) reads
 * from this array. To swap in real content later, replace the pool text per
 * `sample-<N>` entry — the structure doesn't need to change.
 */
export const projects: Project[] = Array.from({ length: 31 }, (_, i) => {
  const n = i + 1;
  const base = BASE_PROJECTS[i % BASE_PROJECTS.length];
  return {
    ...base,
    slug: `sample-${n}`,
    category: WORK_CATEGORIES[i % WORK_CATEGORIES.length],
    year: 2025 - (i % 4),
    featured: i < 3, // first three feed the home "Selected work" grid
    cover: `/work-samples/sample${n}.jpeg`,
    images: [],
  };
});

export function getAllProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  const featured = projects.filter((p) => p.featured);
  return featured.length > 0 ? featured : projects.slice(0, 3);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Previous/next for case-study navigation (wraps around). */
export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  const prev = projects[(i - 1 + projects.length) % projects.length] ?? null;
  const next = projects[(i + 1) % projects.length] ?? null;
  return { prev, next };
}
