import { NextResponse } from "next/server";

import { listArtworks } from "@/lib/artworks";

export const revalidate = 60;

/** GET /api/artworks — the collection, from Neon when configured. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const featuredOnly = searchParams.get("featured") === "true";

  let artworks = await listArtworks();

  if (collection && collection !== "All works") {
    artworks = artworks.filter((artwork) => artwork.collection === collection);
  }
  if (featuredOnly) {
    artworks = artworks.filter((artwork) => artwork.isFeatured);
  }

  return NextResponse.json({ artworks, count: artworks.length });
}
