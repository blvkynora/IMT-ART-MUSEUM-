import { and, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { artworks, orderItems, orders, type ShippingAddress } from "@/drizzle/schema";
import { getArtworksByIds } from "@/lib/artworks";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { makeOrderNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders — the checkout endpoint.
 *
 * Security note, because it matters: prices are NEVER read from the
 * client. The request carries artwork IDs and quantities only; every
 * amount is recomputed here from the catalogue. A tampered payload can
 * choose what to buy, never what to pay.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

interface IncomingItem {
  artworkId: string;
  quantity: number;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  /* ── Collect items ─────────────────────────────────────── */
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const wanted: IncomingItem[] = [];

  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) continue;
    const entry = raw as Record<string, unknown>;
    const artworkId = text(entry.artworkId);
    const quantity =
      typeof entry.quantity === "number" && Number.isFinite(entry.quantity)
        ? Math.trunc(entry.quantity)
        : 1;
    if (artworkId && quantity > 0) wanted.push({ artworkId, quantity });
  }

  if (wanted.length === 0) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 422 });
  }

  /* ── Validate the customer ─────────────────────────────── */
  const email = text(body.email);
  const customerName = text(body.customerName);
  const address = (body.address ?? {}) as Record<string, unknown>;

  const shippingAddress: ShippingAddress = {
    name: text(address.name) || customerName,
    line1: text(address.line1),
    line2: text(address.line2) || undefined,
    city: text(address.city),
    postalCode: text(address.postalCode),
    country: text(address.country),
  };

  const missing: string[] = (
    [
      ["email", email],
      ["customerName", customerName],
      ["address.line1", shippingAddress.line1],
      ["address.city", shippingAddress.city],
      ["address.postalCode", shippingAddress.postalCode],
      ["address.country", shippingAddress.country],
    ] as const
  )
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (!EMAIL.test(email)) missing.push("email (invalid)");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid: ${missing.join(", ")}` },
      { status: 422 },
    );
  }

  /* ── Re-price server-side ──────────────────────────────── */
  const catalogue = await getArtworksByIds(wanted.map((item) => item.artworkId));

  const lines = wanted.flatMap((item) => {
    const artwork = catalogue.find((candidate) => candidate.id === item.artworkId);
    if (!artwork || artwork.status !== "AVAILABLE" || artwork.stock < 1) return [];
    return [
      {
        artwork,
        quantity: Math.min(item.quantity, artwork.stock),
      },
    ];
  });

  if (lines.length === 0) {
    return NextResponse.json(
      { error: "None of the selected works are still available." },
      { status: 409 },
    );
  }

  const currency = lines[0].artwork.currency;
  const subtotalCents = lines.reduce(
    (total, line) => total + line.artwork.priceCents * line.quantity,
    0,
  );
  const shippingCents = 0; // White-glove delivery is included.
  const totalCents = subtotalCents + shippingCents;
  const number = makeOrderNumber();
  const note = text(body.note) || null;

  /* ── Persist (order + lines + stock in one transaction) ── */
  let persisted = false;

  if (isDatabaseConfigured()) {
    const db = getDb();
    const orderId = crypto.randomUUID();

    await db.batch([
      db.insert(orders).values({
        id: orderId,
        number,
        email,
        customerName,
        status: "PENDING",
        subtotalCents,
        shippingCents,
        totalCents,
        currency,
        shippingAddress,
        note,
      }),
      db.insert(orderItems).values(
        lines.map((line) => ({
          orderId,
          artworkId: line.artwork.id,
          titleSnapshot: line.artwork.title,
          artistSnapshot: line.artwork.artist,
          imageUrlSnapshot: line.artwork.imageUrl,
          unitPriceCents: line.artwork.priceCents,
          quantity: line.quantity,
        })),
      ),
      // Guarded decrement: stock can never go negative.
      ...lines.map((line) =>
        db
          .update(artworks)
          .set({ stock: sql`${artworks.stock} - ${line.quantity}`, updatedAt: new Date() })
          .where(
            and(
              eq(artworks.id, line.artwork.id),
              gte(artworks.stock, line.quantity),
            ),
          ),
      ),
    ]);

    persisted = true;
  } else {
    console.info(
      `[imt] order ${number} accepted in demo mode (no DATABASE_URL): ${lines.length} line(s), ${totalCents} ${currency} cents`,
    );
  }

  return NextResponse.json(
    {
      order: {
        number,
        totalCents,
        currency,
        itemCount: lines.reduce((total, line) => total + line.quantity, 0),
        persisted,
      },
    },
    { status: 201 },
  );
}
