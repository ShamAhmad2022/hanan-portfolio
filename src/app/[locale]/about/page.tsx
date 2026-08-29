import type { Metadata } from "next";
import { getDictionary } from "@/lib/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.about.title, description: t.about.introParagraphs[0] };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-6 tablet:px-6 laptop:pt-24 laptop:pb-8">
      {/* <div className="flex flex-col gap-6 tablet:flex-row tablet:items-center">
        <div
          aria-hidden
          className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-secondary font-heading text-3xl font-semibold text-muted-foreground"
        >
          {SITE.owner.charAt(0)}
        </div>
        <h1 className="font-heading text-4xl font-semibold laptop:text-5xl">{t.about.heading}</h1>
      </div>

      <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
        {t.about.bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div> */}

      <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance laptop:text-4xl">
        {t.about.greeting}
      </h2>

      {<div className="mt-4 text-lg text-muted-foreground text-pretty laptop:text-xl">{
        t.about.introParagraphs.map((paragraph, i) => (
          <p key={i} className="mt-4 text-lg text-muted-foreground text-pretty laptop:text-xl">
            {paragraph}
          </p>
        ))
      }</div>}

      <ul className="mt-6 grid grid-cols-1 gap-2 text-muted-foreground tablet:grid-cols-2 laptop:mt-8 laptop:gap-3">
        {t.about.introSkills.map((skill, i) => (
          <li key={i} className="flex items-center gap-2 text-lg">
            <span className="text-brand">•</span>
            <span>{skill}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-lg text-muted-foreground text-pretty laptop:mt-8 laptop:text-xl">
        {t.about.lastIntroParagraphs}
      </p>
    </section>
  );
}
