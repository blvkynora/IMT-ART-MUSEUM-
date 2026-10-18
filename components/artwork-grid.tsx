"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { ArtworkCard } from "@/components/artwork-card";
import type { Artwork } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const ALL = "All works";

interface ArtworkGridProps {
  artworks: Artwork[];
}

/**
 * Responsive collection grid with animated collection filtering.
 *
 * `layout` on the cards + AnimatePresence keeps reordering calm: cards
 * glide into their new position rather than the grid snapping.
 */
export function ArtworkGrid({ artworks }: ArtworkGridProps) {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<string>(ALL);

  const collections = useMemo(() => {
    const counts = new Map<string, number>();
    for (const artwork of artworks) {
      counts.set(artwork.collection, (counts.get(artwork.collection) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [artworks]);

  const visible = useMemo(
    () =>
      filter === ALL
        ? artworks
        : artworks.filter((artwork) => artwork.collection === filter),
    [artworks, filter],
  );

  const filters = [ALL, ...collections.map(([name]) => name)];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter works by collection"
        className="no-scrollbar -mx-5 flex items-center gap-1 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0"
      >
        {filters.map((name) => {
          const isActive = filter === name;
          const count =
            name === ALL
              ? artworks.length
              : (collections.find(([collection]) => collection === name)?.[1] ?? 0);

          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(name)}
              className={cn(
                "label-caps relative shrink-0 rounded-full px-4 py-2.5 transition-colors duration-500",
                isActive ? "text-bone" : "text-stone hover:text-ink",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="collection-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-navy"
                  transition={{ duration: 0.5, ease: EASE }}
                />
              )}
              <span className="flex items-baseline gap-2">
                {name}
                <span
                  className={cn(
                    "text-[0.58rem] tabular-nums",
                    isActive ? "text-bone/55" : "text-stone/60",
                  )}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul
        layout={!reduceMotion}
        className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((artwork, index) => (
            <motion.li key={artwork.id} layout={!reduceMotion} className="list-none">
              <ArtworkCard artwork={artwork} index={index} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <p className="sr-only" aria-live="polite">
        {`${visible.length} ${visible.length === 1 ? "work" : "works"} shown`}
      </p>
    </div>
  );
}
