import type { Metadata } from "next";
import { getDictionary } from "@/lib/locales";
import { getAllProjects } from "@/lib/data/projects";
import { WorkFilter } from "./_components/WorkFilter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.work.title, description: t.work.subtitle };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const projects = getAllProjects();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 tablet:px-6 laptop:py-20">
      <h1 className="font-heading text-4xl font-semibold laptop:text-5xl">{t.work.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t.work.subtitle}</p>
      <WorkFilter projects={projects} />
    </section>
  );
}
