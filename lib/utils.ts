import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts correctly. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

/**
 * Money lives in integer minor units (cents) everywhere — never floats.
 * Whole amounts render without decimals ("$18,500"), fractional amounts keep two.
 */
export function formatPrice(cents: number, currency = "USD"): string {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }

  const hasFraction = cents % 100 !== 0;
  if (!hasFraction) return formatter.format(cents / 100);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** "01", "02", … — used for editorial numbering. */
export function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

/** Stable, human-readable order reference: IMT-7F2K-9QX. */
export function makeOrderNumber(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from(
      { length: n },
      () => alphabet[Math.floor(random() * alphabet.length)],
    ).join("");
  return `IMT-${pick(4)}-${pick(3)}`;
}
