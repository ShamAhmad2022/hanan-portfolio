export const i18n = {
  defaultLocale: "en",
  locales: ["en", "ar"],
  localeDetection: true,
} as const;

export type Locale = (typeof i18n)["locales"][number];
