import type { Metadata } from "next";
import { getDictionary } from "@/lib/locales";
import { SITE } from "@/lib/constants";
import { SocialLinks } from "@/components/shared/SocialLinks";
import { ContactForm } from "./_components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.contact.title, description: t.contact.intro };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 tablet:px-6 laptop:py-24">
      <h1 className="font-heading text-4xl font-semibold laptop:text-5xl">{t.contact.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t.contact.intro}</p>

      <div className="mt-10">
        <ContactForm />
      </div>

      <div className="mt-10 border-t border-border/60 pt-6">
        <p className="text-sm text-muted-foreground">{t.contact.orEmail}</p>
        <a
          href={`mailto:${SITE.email}`}
          className="font-heading text-lg font-medium text-brand hover:underline"
        >
          {SITE.email}
        </a>
        <div className="mt-4">
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
