"use client";

import { useState } from "react";
import Image from "next/image";
import {
  WORK_CATEGORIES,
  SHOW_WORK_META,
  ADDITIONAL_GALLERIES,
  type WorkCategory,
} from "@/lib/constants";
import type { Project } from "@/lib/data/projects";
import { useLocale } from "@/lib/hooks/useLocale";
import { categoryLabel, categoryDescription, additionalGalleryTitle } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/shared/ProjectCard";

export function WorkFilter({ projects }: { projects: Project[] }) {
  const { t, locale } = useLocale();
  const [active, setActive] = useState<string>("all");

  const categories = WORK_CATEGORIES.filter((c) => projects.some((p) => p.category === c));
  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);
  const description = categoryDescription(t, active);
  const gallery = active === "all" ? undefined : ADDITIONAL_GALLERIES[active as WorkCategory];
  const galleryTitle = additionalGalleryTitle(t, active);

  return (
    <>
      {SHOW_WORK_META.filters && (
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            {t.work.all}
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={active === category}
              onClick={() => setActive(category)}
            >
              {categoryLabel(t, category)}
            </FilterChip>
          ))}
        </div>
      )}

      {SHOW_WORK_META.filters && description ? (
        <p
          aria-live="polite"
          className="mt-6 max-w-auto whitespace-pre-line text-muted-foreground"
        >
          {description}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.work.empty}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      )}

      {gallery?.enabled && gallery.images.length > 0 ? (
        <section className="mt-16">
          {galleryTitle ? (
            <h2 className="font-heading text-2xl font-semibold laptop:text-3xl">{galleryTitle}</h2>
          ) : null}
          <div className="mt-6 space-y-6">
            {gallery.images.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border/60 bg-secondary"
              >
                <Image
                  src={src}
                  alt={`${categoryLabel(t, active)} — ${i + 1}`}
                  fill
                  sizes="(max-width: 1240px) 100vw, 1152px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
