"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/wordmark";
import { useCart, useCartCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#collection", label: "Collection" },
  { href: "/#curatorial", label: "Curatorial" },
  { href: "/#visit", label: "Visit" },
] as const;

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { href: "/checkout", label: "Checkout" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const count = useCartCount();
  const openCart = useCart((state) => state.open);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // The header is only ever transparent while it floats over the hero.
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color,backdrop-filter] duration-700 ease-luxe",
          overHero
            ? "border-b border-transparent bg-transparent text-bone"
            : "border-b bg-bone/80 text-ink backdrop-blur-xl hairline",
        )}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6 md:h-20">
          <Wordmark onDark={overHero} priority />

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="label-caps rule-reveal py-2 opacity-80 transition-opacity duration-500 hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openCart}
              className="group flex items-center gap-2.5 rounded-full px-3 py-2 transition-colors duration-500 hover:bg-current/5"
              aria-label={`Open bag, ${count} ${count === 1 ? "work" : "works"}`}
            >
              <ShoppingBag
                className="size-[18px] transition-transform duration-500 ease-luxe group-hover:-translate-y-0.5"
                strokeWidth={1.25}
                aria-hidden
              />
              <span className="label-caps-sm hidden sm:inline">Bag</span>
              <span
                aria-hidden
                className={cn(
                  "label-caps-sm grid size-[18px] place-items-center rounded-full text-[0.6rem] tabular-nums transition-all duration-500",
                  count > 0
                    ? "bg-navy text-bone"
                    : "border border-current/25 text-current/50",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.28, ease: EASE }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2.5 transition-colors duration-500 hover:bg-current/5 md:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="size-5" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col bg-ink text-bone md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE, delay: 0.15 } }}
          >
            <div className="shell flex h-[72px] shrink-0 items-center justify-between">
              <Wordmark className="text-bone" onDark />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2.5 text-bone/70 transition-colors hover:bg-bone/10 hover:text-bone"
                aria-label="Close menu"
                autoFocus
              >
                <X className="size-5" strokeWidth={1.25} aria-hidden />
              </button>
            </div>

            <nav
              aria-label="Mobile"
              className="shell flex flex-1 flex-col justify-center gap-1 pb-10"
            >
              {MOBILE_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.25, delay: index * 0.03 } }}
                  transition={{ duration: 0.8, delay: 0.12 + index * 0.07, ease: EASE }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline justify-between border-b border-bone/10 py-5"
                  >
                    <span className="font-display text-4xl leading-none sm:text-5xl">
                      {link.label}
                    </span>
                    <span className="label-caps-sm text-bone/35 transition-colors group-hover:text-navy-soft">
                      0{index + 1}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              className="shell shrink-0 pb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="label-caps-sm text-bone/40">By appointment</p>
              <p className="mt-2 font-display text-xl">New York · Paris · Lagos</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
