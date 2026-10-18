/**
 * Domain types. These are the shape the UI cares about — deliberately
 * decoupled from the database rows so the app can run on the demo
 * catalogue or on Neon without a single component changing.
 */

export type ArtworkStatus = "AVAILABLE" | "SOLD" | "RESERVED" | "ARCHIVED";

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  dimensions: string;
  description: string;
  /** Canonical Cloudinary URL. Variants are derived by `lib/cloudinary.ts`. */
  imageUrl: string;
  priceCents: number;
  currency: string;
  edition: string | null;
  isFeatured: boolean;
  stock: number;
  status: ArtworkStatus;
  collection: string;
}

export interface CartLine {
  artworkId: string;
  slug: string;
  title: string;
  artist: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
  quantity: number;
}

export interface OrderDraft {
  email: string;
  customerName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  note?: string;
}

export interface PlacedOrder {
  number: string;
  totalCents: number;
  currency: string;
  itemCount: number;
  persisted: boolean;
}
