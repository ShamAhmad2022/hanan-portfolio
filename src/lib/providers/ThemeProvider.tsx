"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Minimal light/dark theme provider (replaces next-themes).
 *
 * Why not next-themes: its `ThemeProvider` renders the anti-flash `<script>`
 * from inside a client component, which React 19 flags with
 * "Encountered a script tag while rendering React component…". We instead emit
 * that script from the **server** layout (see `THEME_INIT_SCRIPT`), so it's part
 * of the SSR HTML and only ever adopted during hydration — never client-created.
 *
 * The app is class-based dark (`@custom-variant dark` in globals.css) with
 * `enableSystem = false`, so a plain `"light" | "dark"` toggle is all we need.
 */

export type Theme = "light" | "dark";

/** localStorage key — kept as "theme" for continuity with prior next-themes usage. */
export const THEME_STORAGE_KEY = "theme";

/**
 * Blocking script rendered by the server layout. Reads the stored theme and
 * applies the `.dark` class + `color-scheme` before first paint (no FOUC).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

type ThemeContextValue = {
  /** The chosen theme. */
  theme: Theme;
  /** Same as `theme` (no system mode) — kept for next-themes API parity. */
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Apply the theme to <html>, optionally suppressing the color transition. */
function applyTheme(theme: Theme, disableTransition = true) {
  const root = document.documentElement;
  let restore: (() => void) | undefined;

  if (disableTransition) {
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode("*,*::before,*::after{transition:none !important}"),
    );
    document.head.appendChild(style);
    restore = () => {
      // Force a reflow so the "no transition" style takes effect before removal.
      window.getComputedStyle(document.body);
      document.head.removeChild(style);
    };
  }

  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  restore?.();
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  // Initialise from the class the anti-flash script already applied to <html>
  // (falls back to the default during SSR). Nothing rendered depends on `theme`,
  // so reading the DOM here can't cause a hydration mismatch — and it avoids
  // synchronising state inside an effect.
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document === "undefined"
      ? defaultTheme
      : document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
  );

  // Keep tabs in sync when the theme changes elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        setThemeState(e.newValue);
        applyTheme(e.newValue, false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore persistence failures */
    }
    applyTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Drop-in replacement for next-themes' `useTheme` (subset actually used). */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}
