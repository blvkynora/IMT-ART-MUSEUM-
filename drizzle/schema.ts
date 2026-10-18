import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * ────────────────────────────────────────────────────────────────
 *  IMT ART MUSEUM — Neon Postgres schema (Drizzle ORM)
 * ────────────────────────────────────────────────────────────────
 *  Money is stored in integer minor units (cents). Never `float`:
 *  a gallery that rounds a 48,000 USD painting is not a gallery.
 *
 *  Tables: artworks · carts · cart_items · orders · order_items
 * ────────────────────────────────────────────────────────────────
 */

export const artworkStatus = pgEnum("artwork_status", [
  "AVAILABLE",
  "SOLD",
  "RESERVED",
  "ARCHIVED",
]);

export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "FULFILLED",
  "CANCELLED",
  "REFUNDED",
]);

const newId = () => crypto.randomUUID();

/* ── Artworks ─────────────────────────────────────────────────── */
export const artworks = pgTable(
  "artworks",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    artist: varchar("artist", { length: 160 }).notNull(),
    year: integer("year").notNull(),
    medium: varchar("medium", { length: 200 }).notNull(),
    dimensions: varchar("dimensions", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),

    /** Canonical Cloudinary delivery URL. */
    imageUrl: text("image_url").notNull(),

    priceCents: integer("price_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    edition: varchar("edition", { length: 80 }),
    isFeatured: boolean("is_featured").notNull().default(false),
    stock: integer("stock").notNull().default(1),
    status: artworkStatus("status").notNull().default("AVAILABLE"),
    collection: text("collection_name").notNull().default("Uncollected"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("artworks_featured_idx").on(table.isFeatured),
    index("artworks_collection_idx").on(table.collection),
    index("artworks_price_idx").on(table.priceCents),
  ],
);

/* ── Carts ────────────────────────────────────────────────────── */
/**
 * A cart is keyed by an opaque `token` stored in an httpOnly cookie,
 * so an anonymous visitor gets a durable cart without an account.
 * Attach `userId` later and the cart follows the customer across
 * devices — no schema change required.
 */
export const carts = pgTable(
  "carts",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    token: varchar("token", { length: 64 }).notNull().unique(),
    userId: text("user_id"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [index("carts_user_idx").on(table.userId)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    artworkId: text("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    /** Price snapshot — a price change must never silently rewrite a cart. */
    unitPriceCents: integer("unit_price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cart_items_cart_artwork_idx").on(table.cartId, table.artworkId),
    index("cart_items_cart_idx").on(table.cartId),
  ],
);

/* ── Orders ───────────────────────────────────────────────────── */
export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    /** Human-facing reference, e.g. IMT-7F2K-9QX. */
    number: varchar("number", { length: 32 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    customerName: varchar("customer_name", { length: 200 }).notNull(),
    status: orderStatus("status").notNull().default("PENDING"),

    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    shippingAddress: jsonb("shipping_address").$type<ShippingAddress>().notNull(),
    note: text("note"),
    userId: text("user_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_email_idx").on(table.email),
    index("orders_created_idx").on(table.createdAt),
  ],
);

/**
 * Order lines are snapshots, not foreign keys: an artwork may be
 * archived, restaged or re-titled, and the invoice must not change.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    artworkId: text("artwork_id").references(() => artworks.id, {
      onDelete: "set null",
    }),
    titleSnapshot: varchar("title_snapshot", { length: 200 }).notNull(),
    artistSnapshot: varchar("artist_snapshot", { length: 160 }).notNull(),
    imageUrlSnapshot: text("image_url_snapshot").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

/* ── Relations ────────────────────────────────────────────────── */
export const artworkRelations = relations(artworks, ({ many }) => ({
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  artwork: one(artworks, {
    fields: [cartItems.artworkId],
    references: [artworks.id],
  }),
}));

export const orderRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  artwork: one(artworks, {
    fields: [orderItems.artworkId],
    references: [artworks.id],
  }),
}));

/* ── Inferred types ───────────────────────────────────────────── */
export type ArtworkRow = typeof artworks.$inferSelect;
export type NewArtworkRow = typeof artworks.$inferInsert;
export type CartRow = typeof carts.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
