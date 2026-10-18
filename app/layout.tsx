import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";

import { CartBoot } from "@/components/cart-boot";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

/**
 * Type system:
 *  · Cormorant Garamond — high-contrast serif for display, titles, prices.
 *  · Jost — a Futura revival for UI. Geometric, quiet, unmistakably modern.
 * Two families, no more. Restraint is the design.
 */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imtartmuseum.com"),
  title: {
    default: "IMT Art Museum — Contemporary & Modern Art",
    template: "%s · IMT Art Museum",
  },
  description:
    "A museum without walls. Singular contemporary and modern works, placed in private collections since 1974. New York · Paris · Lagos.",
  keywords: [
    "art gallery",
    "contemporary art",
    "art museum",
    "fine art",
    "private collection",
    "art acquisition",
  ],
  openGraph: {
    title: "IMT Art Museum — Contemporary & Modern Art",
    description:
      "Singular contemporary and modern works, placed in private collections since 1974.",
    type: "website",
    locale: "en_US",
    siteName: "IMT Art Museum",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMT Art Museum",
    description:
      "Singular contemporary and modern works, placed in private collections since 1974.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-bone font-sans text-ink antialiased">
        <a
          href="#main"
          className="label-caps sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-bone"
        >
          Skip to content
        </a>

        <CartBoot />
        <SiteHeader />

        <main id="main">{children}</main>

        <SiteFooter />
        <CartDrawer />
      </body>
    </html>
  );
}
