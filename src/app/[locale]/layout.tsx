import "../globals.css";
import type { Metadata } from "next";
import { Inter, Poppins, Cairo } from "next/font/google";
import { i18n } from "@/lib/locales/i18n.config";
import { getDictionary } from "@/lib/locales";
import { SITE } from "@/lib/constants";
import { Providers } from "@/lib/providers/Providers";
import { THEME_INIT_SCRIPT } from "@/lib/providers/ThemeProvider";
import { NavBar } from "@/components/shared/NavBar";
import { Footer } from "@/components/shared/Footer";

// Latin: Inter (body) + Poppins (headings)
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});
// Arabic: Cairo (both roles)
const cairoSans = Cairo({ subsets: ["arabic", "latin"], variable: "--font-sans", display: "swap" });
const cairoHeading = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t.meta.title, template: `%s — ${SITE.brand}` },
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: SITE.url,
      siteName: SITE.brand,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontVars =
    locale === "ar"
      ? `${cairoSans.variable} ${cairoHeading.variable}`
      : `${inter.variable} ${poppins.variable}`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={`${fontVars} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* Anti-flash theme init — server-rendered so it runs before paint and
            is never re-created on the client (avoids React 19's script warning). */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers dir={dir}>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
