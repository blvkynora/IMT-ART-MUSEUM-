import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter-form";
import { Wordmark } from "@/components/wordmark";

const COLUMNS = [
  {
    title: "Collection",
    links: [
      { label: "All works", href: "/#collection" },
      { label: "Featured", href: "/#featured" },
      { label: "Curatorial", href: "/#curatorial" },
    ],
  },
  {
    title: "Museum",
    links: [
      { label: "Visit", href: "/#visit" },
      { label: "Private view", href: "/#visit" },
      { label: "Your bag", href: "/checkout" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "artfine227@gmail.com", href: "mailto:artfine227@gmail.com" },
      { label: "+2347070257113", href: "tel:+2347070257113" },
      { label: "Instagram", href: "https://instagram.com/afaa_official4" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-void text-bone">
      <div className="shell pt-20 pb-10 md:pt-28">
        <div className="grid gap-14 border-b border-bone/12 pb-16 lg:grid-cols-[1.1fr_1.4fr] lg:gap-20">
          <div>
            <Wordmark className="text-bone" onDark />
            <p className="mt-8 max-w-md font-display text-2xl leading-[1.35] text-bone/85 md:text-[1.75rem]">
              A museum without walls — placing singular works in private
              collections since 1974.
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone/45">
              Each acquisition is accompanied by a signed certificate of
              authenticity, full provenance documentation and condition report.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="label-caps-sm text-bone/35">{column.title}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="rule-reveal inline-block text-sm font-light text-bone/70 transition-colors duration-500 hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="sm:col-span-2 lg:col-span-1">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-caps-sm text-bone/30">
            © {year} IMT Art Museum. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/#visit"
              className="label-caps-sm text-bone/40 transition-colors hover:text-bone"
            >
              Privacy
            </Link>
            <Link
              href="/#visit"
              className="label-caps-sm text-bone/40 transition-colors hover:text-bone"
            >
              Terms
            </Link>
            <span className="label-caps-sm tracking-[0.28em] text-brass">
              Made by ita
            </span>
          </div>
        </div>
      </div>

      {/* Oversized signature, cropped by the viewport edge. */}
      <div aria-hidden className="pointer-events-none select-none">
        <p className="-mb-[0.18em] translate-y-[0.06em] text-center font-display text-[clamp(3.5rem,15vw,13rem)] leading-[0.8] whitespace-nowrap text-bone/[0.055]">
          IMT Art Museum
        </p>
      </div>
    </footer>
  );
}
