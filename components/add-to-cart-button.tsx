"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/lib/store/cart";
import type { Artwork } from "@/lib/types";
import { cn } from "@/lib/utils";

type ButtonVariant = "ghost" | "solid" | "bare";
type ButtonSize = "sm" | "md" | "lg";

interface AddToCartButtonProps {
  artwork: Artwork;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Text for the idle state. Defaults to "Add to bag". */
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "gap-2 px-4 py-2.5 text-[0.62rem]",
  md: "gap-2.5 px-6 py-3.5 text-[0.66rem]",
  lg: "gap-3 px-8 py-4.5 text-[0.7rem]",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ghost:
    "border border-current/25 bg-transparent hover:border-ink hover:bg-ink hover:text-bone",
  solid: "border border-ink bg-ink text-bone hover:bg-graphite",
  bare: "border border-transparent px-0 hover:text-navy",
};

/**
 * The single most-tapped element in the store, so it earns the most care:
 * a tactile press, a held "Added" confirmation, and a disabled state that
 * explains itself instead of silently failing.
 */
export function AddToCartButton({
  artwork,
  variant = "ghost",
  size = "md",
  label = "Add to bag",
  showIcon = true,
  className,
}: AddToCartButtonProps) {
  const add = useCart((state) => state.add);
  const reduceMotion = useReducedMotion();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const unavailable =
    artwork.status !== "AVAILABLE" || artwork.stock < 1;
  const unavailableLabel =
    artwork.status === "SOLD" || artwork.stock < 1
      ? "Acquired"
      : artwork.status === "RESERVED"
        ? "On reserve"
        : "Unavailable";

  const handleClick = () => {
    if (unavailable) return;
    add(artwork);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1700);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={unavailable}
      whileTap={reduceMotion || unavailable ? undefined : { scale: 0.975 }}
      className={cn(
        "label-caps relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap transition-colors duration-500 ease-luxe",
        SIZE_CLASSES[size],
        unavailable ? "cursor-not-allowed border border-current/15 opacity-40" : VARIANT_CLASSES[variant],
        className,
      )}
      aria-label={unavailable ? `${unavailableLabel} — ${artwork.title}` : `${label} — ${artwork.title}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {unavailable ? (
          <motion.span key="unavailable" className="inline-flex items-center">
            {unavailableLabel}
          </motion.span>
        ) : added ? (
          <motion.span
            key="added"
            className="inline-flex items-center gap-[inherit]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
            <span>In your bag</span>
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            className="inline-flex items-center gap-[inherit]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {showIcon && <Plus className="size-3.5" strokeWidth={1.5} aria-hidden />}
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
      <span aria-live="polite" className="sr-only">
        {added ? `${artwork.title} added to your bag` : ""}
      </span>
    </motion.button>
  );
}
