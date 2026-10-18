import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/drizzle/schema";

export type Database = NeonHttpDatabase<typeof schema>;

/**
 * The database is OPTIONAL by design.
 *
 * Without DATABASE_URL the site serves the demo catalogue and keeps
 * carts in the browser — so a fresh clone runs beautifully before
 * anyone has touched Neon. Set DATABASE_URL and every server-side
 * read/write goes to Postgres instead. No component changes.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Neon's HTTP driver is stateless and proxy-friendly, which makes it
 * the right fit for serverless/edge route handlers. Multi-statement
 * writes still get transactional behaviour via `db.batch()`.
 */
const globalForDb = globalThis as unknown as { __imtDb?: Database };

export function getDb(): Database {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env to enable persistence.",
    );
  }

  // Reuse one client across hot reloads and route invocations.
  globalForDb.__imtDb ??= drizzle(neon(process.env.DATABASE_URL!), { schema });
  return globalForDb.__imtDb;
}
