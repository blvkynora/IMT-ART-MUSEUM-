"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { variants as cloud } from "@/lib/cloudinary";
import type { Artwork } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ArtworkCardProps {
  artwork: Artwork;
  /** Index within the visible grid — drives the entrance cascade. */
  index?: number;
  priority?: boolean;
  className?: string;
}

/**
 * The gallery's unit of currency: image, title, price, add-to-bag.
 *
 * The whole plate is a link, but "Add to bag" is a real <button> layered
 * outside that link — so keyboard users get one clear action per intent,
 * and no nested-interactive HTML.
 */
export function ArtworkCard({
  artwork,
  index = 0,
  priority = false,
  className,
}: ArtworkCardProps) {
  const reduceMotion = useReducedMotion();
  const unavailable = artwork.status !== "AVAILABLE" || artwork.stock < 1;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -10, transition: { duration: 0.3 } }}
      viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
      transition={{
        duration: 0.95,
        delay: Math.min(index * 0.055, 0.4),
        ease: EASE,
        layout: { duration: 0.5, ease: EASE },
      }}
      className={cn("group relative flex flex-col", className)}
    >
      <Link
        href={`/artworks/${artwork.slug}`}
        className="relative block overflow-hidden bg-paper"
        aria-label={`${artwork.title} by ${artwork.artist} — view the work`}
      >
        <div className="relative aspect-3/4 w-full overflow-hidden">
          <motion.div
            className="absolute inset-0"
            whileHover={reduceMotion ? undefined : { scale: 1.055 }}
            transition={{ duration: 1.25, ease: EASE }}
          >
            <Image
              src={cloud.card(artwork.imageUrl)}
              alt={`${artwork.title}, ${artwork.year} — ${artwork.medium}`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 92vw"
              className="object-cover"
            />
          </motion.div>

          {/* A whisper of shadow on hover — depth without decoration. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-void/0 transition-colors duration-700 ease-luxe group-hover:bg-void/12"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 m-3 border border-bone/40 opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100"
          />

          {unavailable && (
            <span className="label-caps-sm absolute top-4 left-4 bg-ink/85 px-2.5 py-1.5 text-bone backdrop-blur-sm">
              {artwork.stock < 1 ? "Acquired" : artwork.status.toLowerCase()}
            </span>
          )}

          <span
            aria-hidden
            className="absolute right-4 bottom-4 grid size-9 translate-y-2 place-items-center rounded-full bg-bone/95 text-ink opacity-0 transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="label-caps-sm text-stone">
            {artwork.collection} · {artwork.year}
          </p>
          {artwork.edition && (
            <p className="label-caps-sm shrink-0 text-stone/80">{artwork.edition}</p>
          )}
        </div>

        <h3 className="mt-2.5 font-display text-[1.4rem] leading-[1.15]">
          <Link
            href={`/artworks/${artwork.slug}`}
            className="transition-colors duration-500 hover:text-navy"
          >
            {artwork.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-sm text-stone">{artwork.artist}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4 hairline">
          <div>
            <p className="sr-only">Price</p>
            <p className="font-display text-xl leading-none tabular-nums">
              {formatPrice(artwork.priceCents, artwork.currency)}
            </p>
            <p className="mt-1 text-[0.68rem] text-stone/80">{artwork.medium}</p>
          </div>
          <AddToCartButton artwork={artwork} size="sm" className="shrink-0" />
        </div>
      </div>
    </motion.article>
  );
}
