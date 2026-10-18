import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { artworks, cartItems, carts } from "@/drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";

export const CART_COOKIE = "imt_cart";
const CART_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Server-side cart persistence.
 *
 * The browser keeps the live cart in Zustand/localStorage for instant
 * feedback; these helpers give the same cart a durable home in Neon so
 * it can survive a device change or feed abandoned-cart reporting.
 *
 * The cart is identified by an httpOnly cookie token — no account
 * required. Attach `carts.userId` when auth lands and the cart follows
 * the customer automatically.
 */

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: CART_TTL_SECONDS,
  secure: process.env.NODE_ENV === "production",
};

export async function readCartToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}

/** Returns the existing token or mints and sets a new one. */
export async function ensureCartToken(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID();
  jar.set(CART_COOKIE, token, cookieOptions);
  return token;
}

export interface ServerCartItem {
  artworkId: string;
  slug: string;
  title: string;
  artist: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
}

export interface ServerCart {
  token: string;
  items: ServerCartItem[];
  subtotalCents: number;
}

/** Find (or lazily create) the cart row for a token. */
export async function findOrCreateCart(token: string) {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(carts)
    .where(eq(carts.token, token))
    .limit(1);

  if (existing) return existing;

  const [created] = await db.insert(carts).values({ token }).returning();
  return created;
}

export async function readServerCart(token: string): Promise<ServerCart> {
  const db = getDb();
  const cart = await findOrCreateCart(token);

  const rows = await db
    .select({
      artworkId: cartItems.artworkId,
      quantity: cartItems.quantity,
      unitPriceCents: cartItems.unitPriceCents,
      slug: artworks.slug,
      title: artworks.title,
      artist: artworks.artist,
      imageUrl: artworks.imageUrl,
    })
    .from(cartItems)
    .innerJoin(artworks, eq(cartItems.artworkId, artworks.id))
    .where(eq(cartItems.cartId, cart.id));

  return {
    token,
    items: rows,
    subtotalCents: rows.reduce(
      (total, row) => total + row.unitPriceCents * row.quantity,
      0,
    ),
  };
}

export function persistenceEnabled(): boolean {
  return isDatabaseConfigured();
}
