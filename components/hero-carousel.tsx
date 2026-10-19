"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { variants as cloud } from "@/lib/cloudinary";
import type { Artwork } from "@/lib/types";
import { cn, formatPrice, pad } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 8200;

interface HeroCarouselProps {
  slides: Artwork[];
}

/**
 * Featured-work carousel, composed as a gallery wall rather than a
 * full-bleed billboard: the work hangs as a lit plate against the ink
 * ground, the label sits beside it. That composition is what lets
 * studio photography (object on a white ground) read as an artwork
 * instead of as product cut-out.
 *
 *  · All slides stay mounted — cross-fades never flash.
 *  · Autoplay pauses on hover, on focus, and under reduced motion.
 *  · Text exits before the next enters; the plate leads.
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const total = slides.length;
  const active = slides[index];

  const goTo = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || reduceMotion || total < 2) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % total), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reduceMotion, total]);

  if (total === 0) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured works"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        }
      }}
      className="relative isolate overflow-hidden bg-ink text-bone focus-visible:outline-offset-[-4px]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 grain opacity-60" />

      <div className="shell relative z-10 pt-24 pb-14 md:pt-28 md:pb-16 lg:min-h-[88svh] lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          {/* ── The plate ─────────────────────────────────────── */}
          <motion.div
            className="order-1 mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-none"
            drag={reduceMotion || total < 2 ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.x < -56) next();
              else if (info.offset.x > 56) previous();
            }}
            style={{ touchAction: "pan-y" }}
          >
            <div className="relative aspect-3/4 w-full overflow-hidden bg-paper shadow-lift">
              {slides.map((artwork, slideIndex) => {
                const isActive = slideIndex === index;
                return (
                  <motion.div
                    key={artwork.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 1.1, ease: EASE }}
                    aria-hidden={!isActive}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{ scale: isActive ? 1.03 : 1 }}
                      transition={{
                        duration: isActive ? AUTOPLAY_MS / 1000 + 2 : 1,
                        ease: "linear",
                      }}
                    >
                      <Image
                        src={cloud.plate(artwork.imageUrl)}
                        alt={`${artwork.title} by ${artwork.artist}`}
                        fill
                        priority={slideIndex === 0}
                        sizes="(min-width: 1024px) 46vw, (min-width: 640px) 26rem, 88vw"
                        draggable={false}
                        className="select-none object-cover"
                      />
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Museum frame — a hairline inset, not a border-weight box. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-3 border border-ink/10 md:inset-4"
              />
              <span className="label-caps-sm absolute top-5 left-5 bg-ink/85 px-2.5 py-1.5 text-bone backdrop-blur-sm">
                Plate {pad(index + 1)}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between gap-4">
              <p className="label-caps-sm text-bone/40 tabular-nums">
                {pad(index + 1)} / {pad(total)}
              </p>
              <p className="label-caps-sm text-right text-bone/40">{active.medium}</p>
            </div>
          </motion.div>

          {/* ── The label ─────────────────────────────────────── */}
          <div className="order-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                  exit: { opacity: 0, y: -12, transition: { duration: 0.4, ease: EASE } },
                }}
              >
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
                  }}
                  className="label-caps flex items-center gap-3 text-navy-soft"
                >
                  <span className="h-px w-8 bg-navy-soft/70" />
                  {active.collection} · {active.year}
                </motion.p>

                <h1 className="mt-5 font-display text-[clamp(2.4rem,5.4vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
                  {active.title.split(" ").map((word, wordIndex) => (
                    <span
                      key={`${word}-${wordIndex}`}
                      className="inline-block overflow-hidden pb-[0.06em] align-bottom"
                    >
                      <motion.span
                        className="inline-block"
                        variants={{
                          hidden: { y: "110%" },
                          visible: {
                            y: "0%",
                            transition: { duration: 1.1, ease: EASE, delay: wordIndex * 0.045 },
                          },
                        }}
                      >
                        {word}
                        {wordIndex < active.title.split(" ").length - 1 ? "\u00A0" : ""}
                      </motion.span>
                    </span>
                  ))}
                </h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.16 } },
                  }}
                  className="mt-4 font-display text-xl text-bone/75 italic"
                >
                  {active.artist}
                </motion.p>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.26 } },
                  }}
                  className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-9"
                >
                  {/* <div>
                    <p className="label-caps-sm text-bone/35">Available for acquisition</p>
                    <p className="mt-2 font-display text-3xl tabular-nums">
                      {formatPrice(active.priceCents, active.currency)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <AddToCartButton
                      artwork={active}
                      size="md"
                      label="Acquire this work"
                      className="border-bone/45 bg-transparent text-bone hover:border-bone hover:bg-bone hover:text-ink"
                    />
                    <Link
                      href={`/artworks/${active.slug}`}
                      className="label-caps group inline-flex items-center gap-2 px-2 py-3.5 text-bone/70 transition-colors hover:text-bone"
                    >
                      View the work
                      <ArrowRight
                        className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </Link>
                  </div>
                   */}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* ── Rail ────────────────────────────────────────── */}
            <div className="mt-10 flex items-end justify-between gap-6 border-t border-bone/15 pt-5 lg:mt-12">
              <div className="flex items-center gap-3">
                {slides.map((artwork, slideIndex) => {
                  const isActive = slideIndex === index;
                  return (
                    <button
                      key={artwork.id}
                      type="button"
                      onClick={() => goTo(slideIndex)}
                      aria-label={`Go to slide ${slideIndex + 1}: ${artwork.title}`}
                      aria-current={isActive ? "true" : undefined}
                      className="group relative py-2"
                    >
                      <span
                        className={cn(
                          "label-caps-sm block transition-colors duration-500",
                          isActive ? "text-bone" : "text-bone/40 group-hover:text-bone/80",
                        )}
                      >
                        {pad(slideIndex + 1)}
                      </span>
                      <span
                        aria-hidden
                        className="mt-2 block h-px w-8 overflow-hidden bg-bone/20 sm:w-12"
                      >
                        {isActive ? (
                          <motion.span
                            key={`${artwork.id}-progress-${paused}`}
                            className="block h-full bg-navy-soft"
                            initial={{ width: paused || reduceMotion ? "100%" : "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: paused || reduceMotion ? 0 : AUTOPLAY_MS / 1000,
                              ease: "linear",
                            }}
                          />
                        ) : (
                          <span className="block h-full w-0 bg-transparent" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous featured work"
                  className="grid size-10 place-items-center rounded-full border border-bone/25 text-bone/80 transition-all duration-500 ease-luxe hover:border-bone hover:bg-bone hover:text-ink"
                >
                  <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next featured work"
                  className="grid size-10 place-items-center rounded-full border border-bone/25 text-bone/80 transition-all duration-500 ease-luxe hover:border-bone hover:bg-bone hover:text-ink"
                >
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic>
        {`Slide ${index + 1} of ${total}: ${active.title} by ${active.artist}`}
      </p>
    </section>
  );
}
