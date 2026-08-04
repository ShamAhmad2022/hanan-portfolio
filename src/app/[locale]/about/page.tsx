import type { Metadata } from "next";
import { getDictionary } from "@/lib/locales";
import { SITE } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.about.title, description: t.about.bio[0] };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 tablet:px-6 laptop:py-24">
      <div className="flex flex-col gap-6 tablet:flex-row tablet:items-center">
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
      </div>
    </section>
  );
}
