import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/locales";
import {
  getAllProjects,
  getProjectBySlug,
  getAdjacentProjects,
} from "@/lib/data/projects";
import { localePath, pickText, categoryLabel } from "@/lib/helpers";
import { Routs } from "@/lib/enums";
import { SHOW_WORK_META } from "@/lib/constants";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: pickText(project.title, locale),
    description: pickText(project.description, locale),
  };
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const t = getDictionary(locale);
  const title = pickText(project.title, locale);
  const { prev, next } = getAdjacentProjects(slug);

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 tablet:px-6 laptop:py-16">
      <Link
        href={localePath(locale, Routs.WORK)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:-scale-x-100" />
        {t.workDetail.backToWork}
      </Link>

      <header className="mt-6">
        {SHOW_WORK_META.detailInfo && (
          <p className="text-sm font-medium text-brand">{categoryLabel(t, project.category)}</p>
        )}
        {SHOW_WORK_META.detailTitle && (
          <h1 className="mt-2 font-heading text-4xl font-semibold laptop:text-5xl">{title}</h1>
        )}
        {SHOW_WORK_META.detailInfo && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {pickText(project.description, locale)}
          </p>
        )}
      </header>

      {SHOW_WORK_META.detailInfo && (
        <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border/60 py-6 tablet:grid-cols-4">
          {project.role && <Meta label={t.workDetail.role} value={pickText(project.role, locale)} />}
          <Meta label={t.workDetail.year} value={String(project.year)} />
          {project.client && <Meta label={t.workDetail.client} value={project.client} />}
          <Meta label={t.workDetail.category} value={categoryLabel(t, project.category)} />
        </dl>
      )}

      <div className="mt-8 space-y-6">
        {project.cover ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-secondary">
            <Image src={project.cover} alt={title} fill sizes="100vw" className="object-contain" priority />
          </div>
        ) : (
          <div
            className="aspect-[16/10] rounded-2xl border border-border/60"
            style={{ backgroundColor: project.color }}
          />
        )}
        {project.images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-secondary"
          >
            <Image src={src} alt={`${title} — ${i + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
        ))}
      </div>

      {SHOW_WORK_META.detailInfo && (project.tags?.length || project.links?.length) ? (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {project.links?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand px-3 py-1 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}

      <nav className="mt-14 flex items-center justify-between gap-4 border-t border-border/60 pt-6">
        {prev ? (
          <Link
            href={localePath(locale, Routs.WORK_DETAILS.replace("SLUG", prev.slug))}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0 rtl:-scale-x-100" />
            <span>
              <span className="block text-xs">{t.workDetail.previousProject}</span>
              {SHOW_WORK_META.navProjectName && (
                <span className="font-heading font-medium text-foreground">
                  {pickText(prev.title, locale)}
                </span>
              )}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={localePath(locale, Routs.WORK_DETAILS.replace("SLUG", next.slug))}
            className="inline-flex items-center gap-2 text-end text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>
              <span className="block text-xs">{t.workDetail.nextProject}</span>
              {SHOW_WORK_META.navProjectName && (
                <span className="font-heading font-medium text-foreground">
                  {pickText(next.title, locale)}
                </span>
              )}
            </span>
            <ArrowRight className="size-4 shrink-0 rtl:-scale-x-100" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
