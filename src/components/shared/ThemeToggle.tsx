"use client";

import { useTheme } from "@/lib/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/hooks/useLocale";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useLocale();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t.nav.toggleTheme}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Icons swap via the `.dark` class on <html> — pure CSS, no JS state, no hydration flash. */}
      <Moon className="size-[18px] dark:hidden" />
      <Sun className="hidden size-[18px] dark:block" />
    </Button>
  );
}
