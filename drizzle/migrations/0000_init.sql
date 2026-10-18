-- ────────────────────────────────────────────────────────────────
-- IMT ART MUSEUM — initial schema
-- Matches drizzle/schema.ts exactly. Idempotent: safe to re-run.
--
-- Normal path:  npm run db:push
-- This file:    node scripts/apply-schema.mjs   (used where the
--               drizzle-kit CLI cannot spawn a child process)
-- ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "artwork_status" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "order_status" AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "artworks" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" varchar(160) NOT NULL UNIQUE,
  "title" varchar(200) NOT NULL,
  "artist" varchar(160) NOT NULL,
  "year" integer NOT NULL,
  "medium" varchar(200) NOT NULL,
  "dimensions" varchar(120) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "image_url" text NOT NULL,
  "price_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'USD' NOT NULL,
  "edition" varchar(80),
  "is_featured" boolean DEFAULT false NOT NULL,
  "stock" integer DEFAULT 1 NOT NULL,
  "status" "artwork_status" DEFAULT 'AVAILABLE' NOT NULL,
  "collection_name" text DEFAULT 'Uncollected' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "artworks_featured_idx" ON "artworks" ("is_featured");

CREATE INDEX IF NOT EXISTS "artworks_collection_idx" ON "artworks" ("collection_name");

CREATE INDEX IF NOT EXISTS "artworks_price_idx" ON "artworks" ("price_cents");

CREATE TABLE IF NOT EXISTS "carts" (
  "id" text PRIMARY KEY NOT NULL,
  "token" varchar(64) NOT NULL UNIQUE,
  "user_id" text,
  "currency" varchar(3) DEFAULT 'USD' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "carts_user_idx" ON "carts" ("user_id");

CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" text PRIMARY KEY NOT NULL,
  "cart_id" text NOT NULL REFERENCES "carts"("id") ON DELETE cascade,
  "artwork_id" text NOT NULL REFERENCES "artworks"("id") ON DELETE restrict,
  "quantity" integer DEFAULT 1 NOT NULL,
  "unit_price_cents" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cart_artwork_idx" ON "cart_items" ("cart_id", "artwork_id");

CREATE INDEX IF NOT EXISTS "cart_items_cart_idx" ON "cart_items" ("cart_id");

CREATE TABLE IF NOT EXISTS "orders" (
  "id" text PRIMARY KEY NOT NULL,
  "number" varchar(32) NOT NULL UNIQUE,
  "email" varchar(320) NOT NULL,
  "customer_name" varchar(200) NOT NULL,
  "status" "order_status" DEFAULT 'PENDING' NOT NULL,
  "subtotal_cents" integer NOT NULL,
  "shipping_cents" integer DEFAULT 0 NOT NULL,
  "total_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'USD' NOT NULL,
  "shipping_address" jsonb NOT NULL,
  "note" text,
  "user_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "orders_email_idx" ON "orders" ("email");

CREATE INDEX IF NOT EXISTS "orders_created_idx" ON "orders" ("created_at");

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "artwork_id" text REFERENCES "artworks"("id") ON DELETE set null,
  "title_snapshot" varchar(200) NOT NULL,
  "artist_snapshot" varchar(160) NOT NULL,
  "image_url_snapshot" text NOT NULL,
  "unit_price_cents" integer NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL
);

CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" ("order_id");
