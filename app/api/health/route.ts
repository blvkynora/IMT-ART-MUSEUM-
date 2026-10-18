import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — is Neon wired up and reachable?
 * Handy as a deploy smoke test and as the first thing to curl after
 * copying a DATABASE_URL into .env.
 */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      database: "not-configured",
      mode: "demo-catalogue",
      message:
        "Set DATABASE_URL in .env to persist carts and orders in Neon. Everything else already works.",
    });
  }

  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 503 },
    );
  }
}
