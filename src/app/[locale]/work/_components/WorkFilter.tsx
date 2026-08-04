"use client";

import { useState } from "react";
import { WORK_CATEGORIES, SHOW_WORK_META } from "@/lib/constants";
import type { Project } from "@/lib/data/projects";
import { useLocale } from "@/lib/hooks/useLocale";
import { categoryLabel } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/shared/ProjectCard";

export function WorkFilter({ projects }: { projects: Project[] }) {
  const { t, locale } = useLocale();
  const [active, setActive] = useState<string>("all");

  const categories = WORK_CATEGORIES.filter((c) => projects.some((p) => p.category === c));
  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

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

      {filtered.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.work.empty}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      )}
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
