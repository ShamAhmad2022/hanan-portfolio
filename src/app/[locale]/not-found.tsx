"use client";

import Link from "next/link";
import { useLocale } from "@/lib/hooks/useLocale";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const { t, localize } = useLocale();
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="font-heading text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.notFound.body}</p>
      <Link href={localize("/")} className={buttonVariants({ className: "mt-6" })}>
        {t.notFound.home}
      </Link>
    </div>
  );
}
