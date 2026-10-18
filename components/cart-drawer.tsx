"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { variants as cloud } from "@/lib/cloudinary";
import { cartCount, cartSubtotal, useCart } from "@/lib/store/cart";
import { cn, formatPrice } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const isOpen = useCart((state) => state.isOpen);
  const lines = useCart((state) => state.lines);
  const close = useCart((state) => state.close);
  const remove = useCart((state) => state.remove);
  const setQuantity = useCart((state) => state.setQuantity);
  const reduceMotion = useReducedMotion();

  const count = useMemo(() => cartCount(lines), [lines]);
  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);
  const currency = lines[0]?.currency ?? "USD";

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]" aria-live="polite">
          <motion.button
            type="button"
            aria-label="Close bag"
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE, delay: 0.1 } }}
            transition={{ duration: 0.45, ease: EASE }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="absolute inset-y-0 right-0 flex w-full max-w-[29rem] flex-col bg-paper text-ink shadow-drawer"
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%", transition: { duration: 0.45, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <header className="flex items-center justify-between border-b px-6 py-5 hairline">
              <div>
                <p className="label-caps-sm text-stone">Selected works</p>
                <h2 className="mt-1.5 font-display text-2xl leading-none">
                  Your bag
                  <span className="ml-2 align-super text-xs text-stone tabular-nums">
                    {count}
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                aria-label="Close bag"
                autoFocus
              >
                <X className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-10 text-center">
                <div className="grid size-16 place-items-center rounded-full border border-ink/10">
                  <span className="font-display text-2xl text-navy">∅</span>
                </div>
                <div>
                  <p className="font-display text-2xl">Nothing selected yet</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone">
                    Every work in the collection is a single acquisition.
                    Begin with the one you cannot stop returning to.
                  </p>
                </div>
                <Link
                  href="/#collection"
                  onClick={close}
                  className="label-caps mt-2 inline-flex items-center gap-2 border-b border-ink/30 pb-1 transition-colors hover:border-ink"
                >
                  Browse the collection
                  <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-6">
                  <ul className="divide-y divide-ink/8">
                    <AnimatePresence initial={false}>
                      {lines.map((line) => (
                        <motion.li
                          key={line.artworkId}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-4 py-5">
                            <Link
                              href={`/artworks/${line.slug}`}
                              onClick={close}
                              className="relative h-24 w-20 shrink-0 overflow-hidden bg-linen"
                            >
                              <Image
                                src={cloud.thumb(line.imageUrl)}
                                alt={line.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </Link>

                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link
                                    href={`/artworks/${line.slug}`}
                                    onClick={close}
                                    className="block truncate font-display text-lg leading-snug hover:text-navy"
                                  >
                                    {line.title}
                                  </Link>
                                  <p className="mt-0.5 truncate text-xs text-stone">
                                    {line.artist}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => remove(line.artworkId)}
                                  className="shrink-0 text-[0.6rem] tracking-[0.16em] text-stone uppercase transition-colors hover:text-oxblood"
                                  aria-label={`Remove ${line.title}`}
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                                <div className="flex items-center border hairline">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQuantity(line.artworkId, line.quantity - 1)
                                    }
                                    className="grid size-8 place-items-center text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                                    aria-label={`Decrease quantity of ${line.title}`}
                                  >
                                    <Minus className="size-3" strokeWidth={1.75} aria-hidden />
                                  </button>
                                  <span className="w-8 text-center text-xs tabular-nums">
                                    {line.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQuantity(line.artworkId, line.quantity + 1)
                                    }
                                    className="grid size-8 place-items-center text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                                    aria-label={`Increase quantity of ${line.title}`}
                                  >
                                    <Plus className="size-3" strokeWidth={1.75} aria-hidden />
                                  </button>
                                </div>
                                <p className="text-sm tabular-nums">
                                  {formatPrice(line.priceCents * line.quantity, line.currency)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <footer className="border-t bg-bone/60 px-6 pt-5 pb-6 hairline">
                  <div className="flex items-baseline justify-between">
                    <span className="label-caps text-stone">Subtotal</span>
                    <span className="font-display text-2xl tabular-nums">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone">
                    Insured, climate-controlled delivery is arranged by our
                    registrar after checkout.
                  </p>

                  <Link
                    href="/checkout"
                    onClick={close}
                    className="group mt-5 flex items-center justify-between bg-ink px-6 py-4 text-bone transition-colors duration-500 hover:bg-graphite"
                  >
                    <span className="label-caps">Proceed to checkout</span>
                    <ArrowRight
                      className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={close}
                    className={cn(
                      "label-caps-sm mt-3 w-full py-2 text-center text-stone transition-colors hover:text-ink",
                    )}
                  >
                    Continue viewing
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
