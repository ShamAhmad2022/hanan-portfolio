"use client";

import { useState } from "react";
import Image from "next/image";
import {
  WORK_CATEGORIES,
  WORK_SUBCATEGORIES,
  SHOW_WORK_META,
  ADDITIONAL_GALLERIES,
  type WorkCategory,
} from "@/lib/constants";
import type { Project } from "@/lib/data/projects";
import { useLocale } from "@/lib/hooks/useLocale";
import {
  categoryLabel,
  categoryDescription,
  subcategoryLabel,
  subcategoryDescription,
  additionalGalleryTitle,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/shared/ProjectCard";

export function WorkFilter({ projects }: { projects: Project[] }) {
  const { t, locale } = useLocale();
  const [active, setActive] = useState<string>("all");
  const [activeSub, setActiveSub] = useState<string | null>(null);

  /** Changing the main tag always clears the sub-tag. */
  const selectCategory = (category: string) => {
    setActive(category);
    setActiveSub(null);
  };

  const categories = WORK_CATEGORIES.filter((c) => projects.some((p) => p.category === c));

  // Empty for "all" and for any category without sub-tags, so the row doesn't
  // render. Only offers sub-tags that actually have pieces, like `categories`.
  const subcategories = (WORK_SUBCATEGORIES[active as WorkCategory] ?? []).filter((s) =>
    projects.some((p) => p.category === active && p.subcategory === s),
  );
  // A sub-tag can only ever apply to the category that declares it, so a stale
  // selection can't narrow another category's grid.
  const effectiveSub = activeSub && subcategories.includes(activeSub) ? activeSub : null;

  const byCategory = active === "all" ? projects : projects.filter((p) => p.category === active);
  const filtered = effectiveSub
    ? byCategory.filter((p) => p.subcategory === effectiveSub)
    : byCategory;
  const description = categoryDescription(t, active);
  const subDescription = effectiveSub ? subcategoryDescription(t, effectiveSub) : "";
  const gallery = active === "all" ? undefined : ADDITIONAL_GALLERIES[active as WorkCategory];
  const galleryTitle = additionalGalleryTitle(t, active);

  return (
    <>
      {SHOW_WORK_META.filters && (
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip active={active === "all"} onClick={() => selectCategory("all")}>
            {t.work.all}
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={active === category}
              onClick={() => selectCategory(category)}
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

      {SHOW_WORK_META.filters && subcategories.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2 border-s-2 border-border ps-4">
          <FilterChip variant="sub" active={effectiveSub === null} onClick={() => setActiveSub(null)}>
            {t.work.all}
          </FilterChip>
          {subcategories.map((sub) => (
            <FilterChip
              key={sub}
              variant="sub"
              active={effectiveSub === sub}
              onClick={() => setActiveSub(sub)}
            >
              {subcategoryLabel(t, sub)}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {SHOW_WORK_META.filters && subDescription ? (
        <p aria-live="polite" className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {subDescription}
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

/** `variant="sub"` renders the smaller, brand-tinted chip used by the sub-tag row. */
function FilterChip({
  active,
  onClick,
  variant = "main",
  children,
}: {
  active: boolean;
  onClick: () => void;
  variant?: "main" | "sub";
  children: React.ReactNode;
}) {
  const sub = variant === "sub";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border font-medium transition-colors",
        sub ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
        active
          ? sub
            ? "border-brand bg-brand text-brand-foreground"
            : "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
