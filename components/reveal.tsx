"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. Use small offsets (0.05–0.2) for a visible cascade. */
  delay?: number;
  /** Vertical travel in px. */
  y?: number;
  once?: boolean;
}

/** Scroll-triggered rise-and-fade. The house default for section content. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
  /** Stagger between words, in seconds. */
  stagger?: number;
}

/**
 * Masked word-by-word reveal for display type. Each word climbs out of
 * a clipped line — the effect reads as letterpress, not as a template.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.055,
}: WordRevealProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) return <span className={className}>{text}</span>;

  return (
    <span className={cn("inline-block", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "108%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{
              duration: 1.05,
              delay: delay + index * stagger,
              ease: EASE,
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

interface HairlineProps {
  className?: string;
  delay?: number;
}

/** A rule that draws itself in — the quiet luxury of a moving 1px line. */
export function DrawLine({ className, delay = 0 }: HairlineProps) {
  return (
    <motion.div
      className={cn("h-px w-full origin-left bg-current opacity-20", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, delay, ease: EASE }}
    />
  );
}
