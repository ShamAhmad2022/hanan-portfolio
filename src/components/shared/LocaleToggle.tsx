"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/hooks/useLocale";

export function LocaleToggle() {
  const { t, toggleLocale } = useLocale();
  return (
    <Button variant="ghost" size="sm" className="font-medium" onClick={toggleLocale}>
      {t.nav.switchLanguage}
    </Button>
  );
}
