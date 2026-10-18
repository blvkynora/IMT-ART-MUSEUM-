import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { Reveal, WordReveal } from "@/components/reveal";
import { variants as cloud } from "@/lib/cloudinary";
import type { Artwork } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface FeatureBandProps {
  artwork: Artwork;
}

/**
 * Single-work editorial band. Deliberately asymmetric: the plate sits
 * wider than the label, the way a wall text sits beside a painting.
 */
export function FeatureBand({ artwork }: FeatureBandProps) {
  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="border-y bg-paper hairline"
    >
      <div className="shell grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <Reveal y={36} className="order-2 lg:order-1">
          <Link
            href={`/artworks/${artwork.slug}`}
            className="group relative block overflow-hidden bg-linen"
          >
            <div className="relative aspect-4/5 w-full sm:aspect-5/6">
              <Image
                src={cloud.card(artwork.imageUrl)}
                alt={`${artwork.title} by ${artwork.artist}`}
                fill
                sizes="(min-width: 1024px) 55vw, 92vw"
                className="object-cover transition-transform duration-[1.6s] ease-luxe group-hover:scale-105"
              />
            </div>
            <span
              aria-hidden
              className="absolute top-5 left-5 bg-ink/80 px-3 py-2 text-bone backdrop-blur-sm"
            >
              <span className="label-caps-sm">Now on view</span>
            </span>
          </Link>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal y={14}>
            <p className="label-caps flex items-center gap-3 text-stone">
              <span className="h-px w-8 bg-navy" />
              {artwork.collection} — {artwork.year}
            </p>
          </Reveal>

          <h2
            id="featured-heading"
            className="mt-6 font-display text-[clamp(2.3rem,5vw,4.2rem)] leading-[0.95]"
          >
            <WordReveal text={artwork.title} />
          </h2>

          <Reveal delay={0.12}>
            <p className="mt-4 font-display text-xl italic text-stone">
              {artwork.artist}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-7 max-w-prose text-[0.95rem] leading-[1.75] text-slate/85">
              {artwork.description}
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 text-sm hairline">
              <div>
                <dt className="label-caps-sm text-stone">Medium</dt>
                <dd className="mt-1.5 text-ink/85">{artwork.medium}</dd>
              </div>
              <div>
                <dt className="label-caps-sm text-stone">Dimensions</dt>
                <dd className="mt-1.5 text-ink/85">{artwork.dimensions}</dd>
              </div>
              <div>
                <dt className="label-caps-sm text-stone">Edition</dt>
                <dd className="mt-1.5 text-ink/85">{artwork.edition ?? "Unique work"}</dd>
              </div>
              <div>
                <dt className="label-caps-sm text-stone">Price</dt>
                <dd className="mt-1.5 font-display text-lg tabular-nums">
                  {formatPrice(artwork.priceCents, artwork.currency)}
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AddToCartButton artwork={artwork} size="lg" label="Acquire this work" />
              <Link
                href={`/artworks/${artwork.slug}`}
                className="label-caps group inline-flex items-center gap-2 px-1 py-4 text-stone transition-colors hover:text-ink"
              >
                Full catalogue entry
                <ArrowRight
                  className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
