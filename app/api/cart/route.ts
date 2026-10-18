import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { cartItems } from "@/drizzle/schema";
import { getArtworksByIds } from "@/lib/artworks";
import {
  ensureCartToken,
  findOrCreateCart,
  persistenceEnabled,
  readCartToken,
  readServerCart,
} from "@/lib/cart-server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Cart persistence API.
 *
 * The UI is client-first (Zustand + localStorage) so the bag is instant.
 * These routes are the durable half: call them from the same actions
 * when DATABASE_URL is configured, and the cart follows the visitor to
 * another device, or feeds abandoned-cart reporting later.
 *
 * Every route degrades to a no-op 202 when no database is configured, so
 * the client can call them unconditionally.
 */

function noDatabase() {
  return NextResponse.json(
    {
      persisted: false,
      items: [],
      subtotalCents: 0,
      message: "DATABASE_URL is not configured — cart is stored in the browser.",
    },
    { status: 202 },
  );
}

export async function GET() {
  if (!persistenceEnabled()) return noDatabase();

  const token = await readCartToken();
  if (!token) {
    return NextResponse.json({ persisted: true, items: [], subtotalCents: 0 });
  }

  const cart = await readServerCart(token);
  return NextResponse.json({ persisted: true, ...cart });
}

export async function POST(request: Request) {
  if (!persistenceEnabled()) return noDatabase();

  let body: { artworkId?: unknown; quantity?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const artworkId = typeof body.artworkId === "string" ? body.artworkId : "";
  const requested =
    typeof body.quantity === "number" && Number.isFinite(body.quantity)
      ? Math.trunc(body.quantity)
      : 1;

  if (!artworkId) {
    return NextResponse.json({ error: "artworkId is required." }, { status: 422 });
  }

  const [artwork] = await getArtworksByIds([artworkId]);
  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  if (artwork.status !== "AVAILABLE" || artwork.stock < 1) {
    return NextResponse.json({ error: "This work is not available." }, { status: 409 });
  }

  const quantity = Math.min(Math.max(requested, 1), artwork.stock, 12);
  const token = await ensureCartToken();
  const cart = await findOrCreateCart(token);
  const db = getDb();

  await db
    .insert(cartItems)
    .values({
      cartId: cart.id,
      artworkId: artwork.id,
      quantity,
      // Price snapshot: a later price change must not rewrite an open bag.
      unitPriceCents: artwork.priceCents,
    })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.artworkId],
      set: {
        quantity: sql`least(${cartItems.quantity} + ${quantity}, ${artwork.stock})`,
      },
    });

  return NextResponse.json({ persisted: true, ...(await readServerCart(token)) });
}

export async function PATCH(request: Request) {
  if (!persistenceEnabled()) return noDatabase();

  let body: { artworkId?: unknown; quantity?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const artworkId = typeof body.artworkId === "string" ? body.artworkId : "";
  const quantity =
    typeof body.quantity === "number" && Number.isFinite(body.quantity)
      ? Math.trunc(body.quantity)
      : NaN;

  if (!artworkId || Number.isNaN(quantity)) {
    return NextResponse.json(
      { error: "artworkId and a numeric quantity are required." },
      { status: 422 },
    );
  }

  const token = await readCartToken();
  if (!token) {
    return NextResponse.json({ error: "No cart." }, { status: 404 });
  }

  const cart = await findOrCreateCart(token);
  const db = getDb();

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.artworkId, artworkId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity: Math.min(quantity, 12) })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.artworkId, artworkId)));
  }

  return NextResponse.json({ persisted: true, ...(await readServerCart(token)) });
}

export async function DELETE() {
  if (!persistenceEnabled()) return noDatabase();

  const token = await readCartToken();
  if (!token) return NextResponse.json({ persisted: true, items: [], subtotalCents: 0 });

  const cart = await findOrCreateCart(token);
  await getDb().delete(cartItems).where(eq(cartItems.cartId, cart.id));

  return NextResponse.json({ persisted: true, items: [], subtotalCents: 0 });
}
