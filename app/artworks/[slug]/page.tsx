import { ArrowLeft, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ArtworkCard } from "@/components/artwork-card";
import { Reveal } from "@/components/reveal";
import { getArtworkBySlug, getRelatedArtworks, listSlugs } from "@/lib/artworks";
import { variants as cloud } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/utils";

interface ArtworkPageProps {
  params: Promise<{ slug: string }>;
}

/** Refresh hourly when a database is connected; static when it is not. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) return { title: "Work not found" };

  const description = `${artwork.title} (${artwork.year}) by ${artwork.artist}. ${artwork.medium}, ${artwork.dimensions}.`;

  return {
    title: `${artwork.title} — ${artwork.artist}`,
    description,
    openGraph: {
      title: `${artwork.title} — ${artwork.artist}`,
      description,
      images: [{ url: cloud.feature(artwork.imageUrl) }],
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) notFound();

  const related = await getRelatedArtworks(artwork, 3);
  const available = artwork.status === "AVAILABLE" && artwork.stock > 0;

  const details = [
    { term: "Year", detail: String(artwork.year) },
    { term: "Medium", detail: artwork.medium },
    { term: "Dimensions", detail: artwork.dimensions },
    { term: "Edition", detail: artwork.edition ?? "Unique work" },
    { term: "Collection", detail: artwork.collection },
    { term: "Reference", detail: artwork.id.replace("art_", "IMT–").toUpperCase() },
  ];

  return (
    <div className="pt-[72px] md:pt-20">
      <div className="shell flex items-center gap-2 pt-8 pb-6">
        <Link
          href="/#collection"
          className="label-caps-sm group inline-flex items-center gap-2 text-stone transition-colors hover:text-ink"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-500 ease-luxe group-hover:-translate-x-1"
            strokeWidth={1.5}
            aria-hidden
          />
          The collection
        </Link>
        <span aria-hidden className="text-stone/40">
          /
        </span>
        <span className="label-caps-sm text-ink/60">{artwork.collection}</span>
      </div>

      <article className="shell grid gap-12 pb-24 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        {/* ── Plate ─────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal y={28}>
            <div className="group relative overflow-hidden bg-paper p-4 md:p-8">
              <div className="relative aspect-3/4 w-full">
                <Image
                  src={cloud.plate(artwork.imageUrl)}
                  alt={`${artwork.title}, ${artwork.year} — ${artwork.medium}, ${artwork.dimensions}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 92vw"
                  className="object-contain transition-transform duration-[2s] ease-luxe group-hover:scale-[1.015]"
                />
              </div>
            </div>
          </Reveal>

          <p className="label-caps-sm mt-4 text-center text-stone/70">
            Studio plate · full condition report available on request
          </p>
        </div>

        {/* ── Wall label ────────────────────────────────────── */}
        <div className="max-w-xl">
          <Reveal y={16}>
            <p className="label-caps flex items-center gap-3 text-stone">
              <span className="h-px w-8 bg-navy" />
              {artwork.collection} — {artwork.year}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,5vw,3.9rem)] leading-[0.96]">
              {artwork.title}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-3 font-display text-2xl italic text-stone">
              {artwork.artist}
            </p>
          </Reveal>

          {/* <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-y py-6 hairline">
              <div>
                <p className="label-caps-sm text-stone">
                  {available ? "Available for acquisition" : "No longer available"}
                </p>
                <p className="mt-2 font-display text-4xl leading-none tabular-nums">
                  {formatPrice(artwork.priceCents, artwork.currency)}
                </p>
              </div>
              {artwork.edition && (
                <p className="label-caps-sm text-stone">{artwork.edition}</p>
              )}
            </div>
          </Reveal> */}

          {/* <Reveal delay={0.24}>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <AddToCartButton
                artwork={artwork}
                size="lg"
                label="Acquire this work"
                variant="solid"
              />
              <a
                href={`mailto:concierge@imtartmuseum.com?subject=${encodeURIComponent(
                  `Enquiry — ${artwork.title} (${artwork.artist})`,
                )}`}
                className="label-caps group inline-flex items-center gap-2 px-1 py-4 text-stone transition-colors hover:text-ink"
              >
                Enquire about this work
                <ArrowRight
                  className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </a>
            </div>
          </Reveal> */}

          <Reveal delay={0.3}>
            <p className="mt-9 text-[0.95rem] leading-[1.8] text-slate/85">
              {artwork.description}
            </p>
          </Reveal>

          <Reveal delay={0.36}>
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-7 hairline">
              {details.map((item) => (
                <div key={item.term}>
                  <dt className="label-caps-sm text-stone">{item.term}</dt>
                  <dd className="mt-1.5 text-sm text-ink/85">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.42}>
            <ul className="mt-10 space-y-4 border-t pt-7 hairline">
              <li className="flex items-start gap-3 text-sm text-slate/80">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-navy"
                  strokeWidth={1.5}
                  aria-hidden
                />
                Signed certificate of authenticity, full provenance file and
                independent condition report included.
              </li>
              <li className="flex items-start gap-3 text-sm text-slate/80">
                <Truck
                  className="mt-0.5 size-4 shrink-0 text-navy"
                  strokeWidth={1.5}
                  aria-hidden
                />
                Insured, climate-controlled delivery arranged worldwide by our
                registrar within ten working days.
              </li>
            </ul>
          </Reveal>
        </div>
      </article>

      {/* ── Related ─────────────────────────────────────────── */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t hairline">
          <div className="shell py-16 md:py-24">
            <div className="flex items-end justify-between gap-6">
              <h2
                id="related-heading"
                className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-tight"
              >
                Also in the collection
              </h2>
              <Link
                href="/#collection"
                className="label-caps-sm group hidden shrink-0 items-center gap-2 text-stone transition-colors hover:text-ink sm:inline-flex"
              >
                View all
                <ArrowRight
                  className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            </div>

            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {related.map((item, index) => (
                <li key={item.id}>
                  <ArtworkCard artwork={item} index={index} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
