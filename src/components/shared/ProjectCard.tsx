import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data/projects";
import { getDictionary } from "@/lib/locales";
import { localePath, pickText, categoryLabel } from "@/lib/helpers";
import { Routs } from "@/lib/enums";

export function ProjectCard({ project, locale }: { project: Project; locale: string }) {
  const t = getDictionary(locale);
  const href = localePath(locale, Routs.WORK_DETAILS.replace("SLUG", project.slug));
  const title = pickText(project.title, locale);

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-secondary">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={title}
            fill
            sizes="(max-width: 820px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ backgroundColor: project.color }}
          />
        )}

        {/* Dark "glass" scrim with the project name — layered above the image. */}
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-black/5 to-transparent p-3">
          <span className="rounded-md border border-white/15 bg-black/30 px-2.5 py-1 font-heading text-sm font-medium text-white shadow-sm backdrop-blur-md">
            {title}
          </span>
        </div>

        <span className="absolute end-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-base font-medium">{title}</h3>
        <span className="shrink-0 text-sm text-muted-foreground">{project.year}</span>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">{categoryLabel(t, project.category)}</p>
    </Link>
  );
}
