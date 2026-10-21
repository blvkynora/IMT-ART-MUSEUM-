import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { artworks } from "../drizzle/schema";
import { catalog } from "../lib/catalog";

/**
 * Seed Neon with the demo catalogue.
 *
 *   npm run db:push     # create tables
 *   npm run db:seed     # insert / refresh artwork rows
 *
 * Idempotent: rows are upserted on `slug`, so running it twice is safe.
 */
async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error(
      "DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string.",
    );
    process.exit(1);
  }

  const db = drizzle(neon(url));

  await db
    .insert(artworks)
    .values(
      catalog.map((artwork) => ({
        id: artwork.id,
        slug: artwork.slug,
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        description: artwork.description,
        imageUrl: artwork.imageUrl,
        priceCents: artwork.priceCents,
        currency: artwork.currency,
        edition: artwork.edition,
        isFeatured: artwork.isFeatured,
        stock: artwork.stock,
        status: artwork.status,
        collection: artwork.collection,
      })),
    )
    .onConflictDoUpdate({
      // Upsert on the stable id, not the slug: renaming a work changes its
      // slug, and keying on slug would insert a duplicate row instead of
      // renaming the existing one.
      target: artworks.id,
      set: {
        slug: sql`excluded.slug`,
        title: sql`excluded.title`,
        artist: sql`excluded.artist`,
        year: sql`excluded.year`,
        medium: sql`excluded.medium`,
        dimensions: sql`excluded.dimensions`,
        description: sql`excluded.description`,
        imageUrl: sql`excluded.image_url`,
        priceCents: sql`excluded.price_cents`,
        currency: sql`excluded.currency`,
        edition: sql`excluded.edition`,
        isFeatured: sql`excluded.is_featured`,
        stock: sql`excluded.stock`,
        status: sql`excluded.status`,
        collection: sql`excluded.collection_name`,
        updatedAt: new Date(),
      },
    });

  console.log(`✓ Seeded ${catalog.length} artworks into Neon.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
