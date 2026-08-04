"use client";

import Link from "next/link";
import { useLocale } from "@/lib/hooks/useLocale";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  const { t, localize } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-6">
        <div>
          <p className="font-heading text-base font-semibold">
            {SITE.brand}
            <span className="text-brand">.</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            © {year} {SITE.brand}. {t.footer.rights}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={localize(link.href)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>

        <SocialLinks />
      </div>
    </footer>
  );
}
