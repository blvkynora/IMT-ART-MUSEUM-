"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/store/cart";

/**
 * The persisted cart is rehydrated deliberately (not during render), so
 * the server-rendered markup and the first client paint agree. Mounted
 * once in the root layout.
 */
export function CartBoot() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  return null;
}
