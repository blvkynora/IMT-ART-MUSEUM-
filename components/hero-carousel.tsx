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
 * Full-bleed featured-work carousel.
 *
 * Design decisions worth keeping:
 *  · All slides stay mounted — cross-fades are instant and never flash.
 *  · The Ken Burns drift is a Framer animation, not CSS, so it restarts
 *    cleanly on every activation instead of drifting out of sync.
 *  · Autoplay pauses on hover, on focus, and for `prefers-reduced-motion`.
 *  · Text exits before the next enters (mode="wait"); the image leads.
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
      className="relative isolate h-[94svh] min-h-[620px] w-full overflow-hidden bg-void text-bone focus-visible:outline-offset-[-4px]"
    >
      {/* ── Imagery ─────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        drag={reduceMotion || total < 2 ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.x < -64) next();
          else if (info.offset.x > 64) previous();
        }}
        style={{ touchAction: "pan-y" }}
      >
        {slides.map((artwork, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <motion.div
              key={artwork.id}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 1.5, ease: EASE }}
              aria-hidden={!isActive}
            >
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ scale: isActive ? 1.09 : 1 }}
                transition={{
                  duration: isActive ? AUTOPLAY_MS / 1000 + 2 : 1.2,
                  ease: "linear",
                }}
              >
                <Image
                  src={cloud.hero(artwork.imageUrl)}
                  alt={`${artwork.title} by ${artwork.artist}`}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  draggable={false}
                  className="select-none object-cover"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Veils ───────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-void/70 via-transparent to-transparent"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      {/* ── Vertical signature ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-6 hidden -translate-y-1/2 xl:block"
      >
        <span className="label-caps-sm block text-bone/35 [writing-mode:vertical-rl]">
          Established 1974 — Contemporary & Modern
        </span>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-14 md:pb-20">
        <div className="shell">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              className="max-w-4xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.085, delayChildren: 0.12 } },
                exit: { opacity: 0, y: -14, transition: { duration: 0.45, ease: EASE } },
              }}
            >
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
                }}
                className="label-caps flex items-center gap-3 text-navy-soft"
              >
                <span className="h-px w-8 bg-navy-soft/70" />
                {active.collection} · {active.year}
              </motion.p>

              <h1 className="mt-6 font-display text-[clamp(2.7rem,7.4vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
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
                          transition: {
                            duration: 1.15,
                            ease: EASE,
                            delay: wordIndex * 0.05,
                          },
                        },
                      }}
                    >
                      {word}
                      {wordIndex < active.title.split(" ").length - 1 ? "\u00A0" : ""}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 0.2 } },
                }}
                className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-bone/70"
              >
                <span className="font-display text-xl text-bone italic">
                  {active.artist}
                </span>
                <span aria-hidden className="hidden h-3 w-px bg-bone/20 sm:block" />
                <span className="text-bone/60">{active.medium}</span>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 0.32 } },
                }}
                className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8"
              >
                <div>
                  <p className="label-caps-sm text-bone/40">Available for acquisition</p>
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
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* ── Rail ──────────────────────────────────────────── */}
          <div className="mt-12 flex items-end justify-between gap-6 border-t border-bone/15 pt-5 md:mt-16">
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
                      className="mt-2 block h-px w-9 overflow-hidden bg-bone/20 sm:w-14"
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
              <span className="label-caps-sm mr-2 hidden text-bone/40 sm:block">
                {pad(index + 1)} / {pad(total)}
              </span>
              <button
                type="button"
                onClick={previous}
                aria-label="Previous featured work"
                className="grid size-11 place-items-center rounded-full border border-bone/25 text-bone/80 transition-all duration-500 ease-luxe hover:border-bone hover:bg-bone hover:text-ink"
              >
                <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next featured work"
                className="grid size-11 place-items-center rounded-full border border-bone/25 text-bone/80 transition-all duration-500 ease-luxe hover:border-bone hover:bg-bone hover:text-ink"
              >
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
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
