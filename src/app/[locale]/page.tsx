import { Fragment } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDictionary } from "@/lib/locales";
import { getFeaturedProjects } from "@/lib/data/projects";
import { localePath } from "@/lib/helpers";
import { Routs } from "@/lib/enums";
import { SITE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { ProjectCard } from "@/components/shared/ProjectCard";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const featured = getFeaturedProjects();

  return (
    <>
      {/* Brand statement */}
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-6 text-center tablet:px-6 laptop:pt-24 laptop:pb-8">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance laptop:text-6xl">
          {SITE.brand}
        </h1>
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-base font-medium text-muted-foreground tablet:text-lg">
          {t.home.services.map((service, i) => (
            <Fragment key={service}>
              {i > 0 && (
                <span aria-hidden className={i % 2 === 1 ? "text-brand" : "text-brand-2"}>
                  •
                </span>
              )}
              <span>{service}</span>
            </Fragment>
          ))}
        </p>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-12 tablet:px-6 laptop:pb-16">

        <p className="mt-4 text-lg text-muted-foreground text-pretty laptop:text-xl">
          {t.home.firstIntroParagraphs}
        </p>

        <p className="mt-4 text-lg text-muted-foreground text-pretty laptop:text-xl">
          {t.home.lastIntroParagraphs}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={localePath(locale, Routs.WORK)}
            className={buttonVariants({ className: "h-11 px-6 text-sm" })}
          >
            {t.home.viewAll}
          </Link>
          {/* <Link
            href={localePath(locale, Routs.CONTACT)}
            className={buttonVariants({ variant: "outline", className: "h-11 px-6 text-sm" })}
          >
            {t.common.getInTouch}
          </Link> */}
        </div>
      </section>

      {/* Selected work */}
      <section className="mx-auto max-w-6xl px-4 py-8 tablet:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold">{t.home.selectedWork}</h2>
          <Link
            href={localePath(locale, Routs.WORK)}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.home.viewAll}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>

      {/* Contact CTA — hidden for now (Contact is suppressed sitewide). Uncomment to restore. */}
      {/*
      <section className="mx-auto max-w-6xl px-4 py-16 tablet:px-6 laptop:py-24">
        <div className="rounded-2xl border border-border/60 bg-secondary/60 p-8 text-center laptop:p-14">
          <h2 className="font-heading text-3xl font-semibold laptop:text-4xl">{t.home.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.home.ctaBody}</p>
          <Link
            href={localePath(locale, Routs.CONTACT)}
            className={buttonVariants({ className: "mt-7 h-11 px-6 text-sm" })}
          >
            {t.home.ctaButton}
          </Link>
        </div>
      </section>
      */}
    </>
  );
}
