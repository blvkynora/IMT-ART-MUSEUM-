import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ArtworkGrid } from "@/components/artwork-grid";
import { FeatureBand } from "@/components/feature-band";
import { HeroCarousel } from "@/components/hero-carousel";
import { Marquee } from "@/components/marquee";
import { DrawLine, Reveal, WordReveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { VisitBand } from "@/components/visit-band";
import { listArtworks, listFeaturedArtworks } from "@/lib/artworks";

export default async function HomePage() {
  const [featured, artworks] = await Promise.all([
    listFeaturedArtworks(4),
    listArtworks(),
  ]);

  const heroSlides = featured.length > 0 ? featured : artworks.slice(0, 4);
  const feature =
    artworks.find((artwork) => artwork.slug === "assembly") ?? artworks[0];

  const collectionCount = new Set(artworks.map((artwork) => artwork.collection)).size;

  const stats = [
    { value: String(artworks.length), label: "Works on view" },
    { value: String(collectionCount), label: "Collections" },
    { value: "3", label: "Cities" },
    { value: "1974", label: "Established" },
  ];

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      <Marquee
        className="border-y border-bone/10 bg-ink py-4 text-bone"
        items={[
          "Contemporary & Modern",
          "Est. 1974",
          "New York",
          "Paris",
          "Lagos",
          "Private acquisitions",
          "Certified provenance",
        ]}
      />

      {/* ── Collection ──────────────────────────────────────── */}
      <section
        id="collection"
        aria-labelledby="collection-heading"
        className="shell scroll-mt-24 pb-24 md:pb-32"
      >
        <SectionHeading
          id="collection-heading"
          eyebrow="The collection"
          title="Works available for acquisition"
          description=""

          action={
            <a
              href="mailto:concierge@imtartmuseum.com"
              className="label-caps group inline-flex items-center gap-2 border-b border-ink/25 pb-2 transition-colors hover:border-ink"
            >
              Enquire privately
              <ArrowRight
                className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </a>
          }
          className="mb-12"
        />

        <ArtworkGrid artworks={artworks} />
      </section>

      {/* ── Featured band ───────────────────────────────────── */}
      {feature && <FeatureBand artwork={feature} />}

      {/* ── Pull quote ──────────────────────────────────────── */}
      <section aria-label="From the collection" className="bg-linen">
        <div className="shell py-20 text-center md:py-28">
          <Reveal y={18}>
            <p className="label-caps-sm text-stone">From the collection</p>
          </Reveal>

          <Reveal delay={0.1}>
            <blockquote className="mx-auto mt-8 max-w-4xl font-display text-[clamp(1.6rem,3.6vw,2.85rem)] leading-[1.28] text-balance">
              &ldquo;A sculpture is not finished when the artist stops. It is
              finished when someone walks around it slowly enough to
              disagree.&rdquo;
            </blockquote>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="label-caps mt-9 text-stone">IMT Studio · on the Civic series</p>
          </Reveal>
        </div>
      </section>

      {/* ── Press ───────────────────────────────────────────── */}
      <section
        aria-label="Press"
        className="border-b bg-bone hairline"
      >
        <div className="shell flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-9">
          <span className="label-caps-sm text-stone/70">As featured in</span>
          {["Frieze", "Artforum", "Apollo", "The Art Newspaper", "Monocle"].map(
            (publication) => (
              <span
                key={publication}
                className="font-display text-lg tracking-wide text-ink/40 transition-colors duration-500 hover:text-ink/80"
              >
                {publication}
              </span>
            ),
          )}
        </div>
      </section>

      <VisitBand />
    </>
  );
}
