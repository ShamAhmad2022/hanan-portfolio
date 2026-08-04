import type { MetadataRoute } from "next";
import { i18n } from "@/lib/locales/i18n.config";
import { getAllProjects } from "@/lib/data/projects";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const paths = [
    "",
    "/work",
    "/about",
    "/contact",
    ...getAllProjects().map((project) => `/work/${project.slug}`),
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of i18n.locales) {
    for (const path of paths) {
      entries.push({ url: `${base}/${locale}${path}`, lastModified: new Date() });
    }
  }
  return entries;
}
