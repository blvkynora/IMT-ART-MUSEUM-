import { asc, eq, inArray, ne } from "drizzle-orm";

import { artworks, type ArtworkRow } from "@/drizzle/schema";
import { catalog, findCatalogArtwork } from "@/lib/catalog";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import type { Artwork } from "@/lib/types";

/**
 * The single read path for artwork data.
 *
 * Every function here prefers Neon and degrades to the in-repo demo
 * catalogue. Reads failing must never take the gallery down — an
 * unavailable database is a degraded experience, not a blank page.
 */

function toDomain(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    artist: row.artist,
    year: row.year,
    medium: row.medium,
    dimensions: row.dimensions,
    description: row.description,
    imageUrl: row.imageUrl,
    priceCents: row.priceCents,
    currency: row.currency,
    edition: row.edition,
    isFeatured: row.isFeatured,
    stock: row.stock,
    status: row.status,
    collection: row.collection,
  };
}

async function withFallback<T>(
  source: string,
  run: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (!isDatabaseConfigured()) return fallback();
  try {
    return await run();
  } catch (error) {
    console.warn(
      `[imt] ${source} fell back to the demo catalogue:`,
      error instanceof Error ? error.message : error,
    );
    return fallback();
  }
}

export async function listArtworks(): Promise<Artwork[]> {
  return withFallback(
    "listArtworks",
    async () => {
      const rows = await getDb()
        .select()
        .from(artworks)
        .where(ne(artworks.status, "ARCHIVED"))
        .orderBy(asc(artworks.createdAt));
      return rows.length > 0 ? rows.map(toDomain) : catalog;
    },
    () => catalog,
  );
}

export async function listFeaturedArtworks(limit = 4): Promise<Artwork[]> {
  return withFallback(
    "listFeaturedArtworks",
    async () => {
      const rows = await getDb()
        .select()
        .from(artworks)
        .where(eq(artworks.isFeatured, true))
        .orderBy(asc(artworks.createdAt))
        .limit(limit);
      return rows.length > 0
        ? rows.map(toDomain)
        : catalog.filter((a) => a.isFeatured).slice(0, limit);
    },
    () => catalog.filter((a) => a.isFeatured).slice(0, limit),
  );
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  return withFallback(
    "getArtworkBySlug",
    async () => {
      const [row] = await getDb()
        .select()
        .from(artworks)
        .where(eq(artworks.slug, slug))
        .limit(1);
      return row ? toDomain(row) : (findCatalogArtwork(slug) ?? null);
    },
    () => findCatalogArtwork(slug) ?? null,
  );
}

export async function getArtworksByIds(ids: string[]): Promise<Artwork[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];

  return withFallback(
    "getArtworksByIds",
    async () => {
      const rows = await getDb()
        .select()
        .from(artworks)
        .where(inArray(artworks.id, unique));
      const found = rows.map(toDomain);
      // Anything the DB did not return may still exist in the demo set.
      const missing = unique.filter((id) => !found.some((a) => a.id === id));
      return [
        ...found,
        ...catalog.filter((a) => missing.includes(a.id)),
      ];
    },
    () => catalog.filter((a) => unique.includes(a.id)),
  );
}

export async function getRelatedArtworks(
  artwork: Artwork,
  limit = 3,
): Promise<Artwork[]> {
  const all = await listArtworks();
  const sameCollection = all.filter(
    (candidate) =>
      candidate.id !== artwork.id && candidate.collection === artwork.collection,
  );
  const others = all.filter(
    (candidate) =>
      candidate.id !== artwork.id && candidate.collection !== artwork.collection,
  );
  return [...sameCollection, ...others].slice(0, limit);
}

export async function listSlugs(): Promise<string[]> {
  const all = await listArtworks();
  return all.map((artwork) => artwork.slug);
}
