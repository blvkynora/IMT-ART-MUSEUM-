"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Artwork, CartLine } from "@/lib/types";

/**
 * Cart state.
 *
 * Client-authoritative and instantly responsive: adding a work must
 * feel like a physical gesture, never a network round trip. The cart
 * is mirrored to localStorage so it survives refreshes, and the same
 * `CartLine` shape is what `/api/cart` persists to Neon when a
 * database is configured (see `lib/cart-server.ts`).
 */
interface CartStore {
  lines: CartLine[];
  isOpen: boolean;
  isHydrated: boolean;

  add: (artwork: Artwork, quantity?: number) => void;
  remove: (artworkId: string) => void;
  setQuantity: (artworkId: string, quantity: number) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  toggle: () => void;
  markHydrated: () => void;
}

const MAX_PER_LINE = 12;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      isHydrated: false,

      add: (artwork, quantity = 1) => {
        if (artwork.status !== "AVAILABLE" || artwork.stock < 1) return;

        const { lines } = get();
        const existing = lines.find((line) => line.artworkId === artwork.id);
        const ceiling = Math.min(artwork.stock, MAX_PER_LINE);

        if (existing) {
          set({
            lines: lines.map((line) =>
              line.artworkId === artwork.id
                ? {
                    ...line,
                    quantity: Math.min(line.quantity + quantity, ceiling),
                  }
                : line,
            ),
          });
          return;
        }

        set({
          lines: [
            ...lines,
            {
              artworkId: artwork.id,
              slug: artwork.slug,
              title: artwork.title,
              artist: artwork.artist,
              imageUrl: artwork.imageUrl,
              priceCents: artwork.priceCents,
              currency: artwork.currency,
              quantity: Math.min(quantity, ceiling),
            },
          ],
        });
      },

      remove: (artworkId) =>
        set({ lines: get().lines.filter((line) => line.artworkId !== artworkId) }),

      setQuantity: (artworkId, quantity) => {
        if (quantity <= 0) {
          get().remove(artworkId);
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.artworkId === artworkId
              ? { ...line, quantity: Math.min(quantity, MAX_PER_LINE) }
              : line,
          ),
        });
      },

      clear: () => set({ lines: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "imt-cart-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated explicitly on mount so server and client first paint agree.
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);

/* ── Derived values (pure, so they can run anywhere) ─────────── */

export const cartCount = (lines: CartLine[]) =>
  lines.reduce((total, line) => total + line.quantity, 0);

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((total, line) => total + line.priceCents * line.quantity, 0);

/** SSR-safe count: 0 until the persisted cart has been rehydrated. */
export function useCartCount(): number {
  return useCart((state) =>
    state.isHydrated ? cartCount(state.lines) : 0,
  );
}
