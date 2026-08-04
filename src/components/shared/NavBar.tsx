"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { NAV_LINKS, SHOW_SOCIALS } from "@/lib/constants";
import { useLocale } from "@/lib/hooks/useLocale";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { selectUi, setIsMobileNavOpen } from "@/lib/store/slices/uiSlice";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";
import { SocialLinks } from "./SocialLinks";

export function NavBar() {
  const { t, localize } = useLocale();
  const dispatch = useAppDispatch();
  const { isMobileNavOpen } = useAppSelector(selectUi);

  const closeNav = () => dispatch(setIsMobileNavOpen(false));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 tablet:px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 tablet:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={localize(link.href)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 tablet:flex">
            {SHOW_SOCIALS && <SocialLinks />}
            <LocaleToggle />
            <ThemeToggle />
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 tablet:hidden">
            <LocaleToggle />
            <ThemeToggle />
            <Sheet
              open={isMobileNavOpen}
              onOpenChange={(open) => dispatch(setIsMobileNavOpen(open))}
            >
              <SheetTrigger
                aria-label={t.nav.menu}
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{t.nav.menu}</SheetTitle>
                </SheetHeader>
                <nav className="mt-2 flex flex-col gap-1 px-2">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.key}
                      href={localize(link.href)}
                      onClick={closeNav}
                      className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                    >
                      {t.nav[link.key]}
                    </Link>
                  ))}
                </nav>
                {SHOW_SOCIALS && (
                  <div className="mt-2 px-4">
                    <SocialLinks />
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
