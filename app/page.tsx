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
    artworks.find((artwork) => artwork.slug === "nocturne-atlantic") ?? artworks[0];

  const artistCount = new Set(artworks.map((artwork) => artwork.artist)).size;
  const collectionCount = new Set(artworks.map((artwork) => artwork.collection)).size;

  const stats = [
    { value: String(artworks.length), label: "Works on view" },
    { value: String(artistCount), label: "Artists represented" },
    { value: String(collectionCount), label: "Collections" },
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

      {/* ── Curatorial note ─────────────────────────────────── */}
      <section
        id="curatorial"
        aria-labelledby="curatorial-heading"
        className="shell scroll-mt-24 py-20 md:py-28"
      >
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <Reveal y={14}>
              <p className="label-caps flex items-center gap-3 text-stone">
                <span className="h-px w-8 bg-navy" />
                Curatorial note
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xs text-sm leading-[1.75] text-stone">
                Founded in 1974 above a bookbinder&rsquo;s workshop in SoHo, IMT
                has spent five decades placing singular works with collectors
                who read before they buy.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <Link
                href="/#collection"
                className="label-caps group mt-9 inline-flex items-center gap-2 border-b border-ink/25 pb-2 transition-colors duration-500 hover:border-ink"
              >
                Explore the collection
                <ArrowRight
                  className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            </Reveal>
          </div>

          <div>
            <h2 id="curatorial-heading">
              <span className="sr-only">Curatorial statement</span>
              <span className="block font-display text-[clamp(1.6rem,3.1vw,2.65rem)] leading-[1.3] text-ink">
                <WordReveal text="We do not collect for walls." stagger={0.05} />{" "}
                <em className="italic text-stone">
                  <WordReveal
                    text="We collect for the conversations that happen in front of them."
                    stagger={0.035}
                    delay={0.15}
                  />
                </em>
              </span>
            </h2>

            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-sm leading-[1.8] text-slate/80">
                Every work in this catalogue has been seen in person by a member
                of the curatorial team before it was listed — condition reviewed,
                provenance verified, and the artist spoken to. What you see here
                is the residue of that process, not a feed.
              </p>
            </Reveal>

            <div className="mt-12">
              <DrawLine />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 pt-8 sm:grid-cols-4">
                {stats.map((stat, index) => (
                  <Reveal key={stat.label} delay={index * 0.07} y={16}>
                    <div>
                      <dd className="font-display text-4xl leading-none tabular-nums md:text-5xl">
                        {stat.value}
                      </dd>
                      <dt className="label-caps-sm mt-3 text-stone">{stat.label}</dt>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

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
          description="Twelve works, four collections, one standard of care. Prices include certified provenance and insured delivery."
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
              &ldquo;A painting is not finished when the artist stops. It is
              finished when someone stands in front of it long enough to
              disagree.&rdquo;
            </blockquote>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="label-caps mt-9 text-stone">Amara Okonkwo · Silent Cartography</p>
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
