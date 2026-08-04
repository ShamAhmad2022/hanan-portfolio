"use client";

import Link from "next/link";
import { useLocale } from "@/lib/hooks/useLocale";
import { SITE } from "@/lib/constants";

export function Logo() {
  const { localize } = useLocale();
  return (
    <Link
      href={localize("/")}
      className="whitespace-nowrap font-heading text-base font-semibold tracking-tight tablet:text-lg"
      aria-label={SITE.brand}
    >
      {SITE.brand}
      <span className="text-brand">.</span>
    </Link>
  );
}
