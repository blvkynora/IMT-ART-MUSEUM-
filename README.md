# IMT ART MUSEUM

A luxury art-gallery storefront: immersive featured-work carousel, filterable
collection, a bag that feels physical, and a checkout that behaves like a
gallery registrar rather than a shopping cart.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Framer Motion**,
**Zustand**, **Cloudinary** and **Neon Postgres via Drizzle ORM**.

> **It runs before you configure anything.** No `.env`, no database, no
> Cloudinary account: `npm run dev` produces the complete gallery, cart and
> checkout flow from an in-repo catalogue. Every database call then quietly
> upgrades to Neon the moment `DATABASE_URL` exists.

---

## 1. Quick start

```bash
# Node 20+ required (built and verified on Node 24)
npm install

npm run dev            # → http://localhost:3000
```

That's it. You should see the hero carousel, the 29-work collection, a working
bag, and a working checkout.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` — zero errors as shipped |
| `npm run db:push` | Create/update tables in Neon from `drizzle/schema.ts` |
| `npm run db:generate` | Emit versioned SQL migrations into `drizzle/migrations` |
| `npm run db:seed` | Upsert the demo catalogue into Neon |
| `npm run db:studio` | Drizzle Studio (browse your tables) |
| `npm run images:check` | Verify every Cloudinary variant in the catalogue returns 200 |

> **Sandbox note:** if `npm install` fails with `EPERM … spawn`, your
> environment blocks npm lifecycle scripts. Use
> `npm install --ignore-scripts` — nothing in this project needs a postinstall
> step.

---

## 2. Connect Neon (optional, 5 minutes)

The app is fully functional without this. Do it when you want carts and orders
to persist.

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Open **Connection Details** and copy the **Pooled connection** string — its
   hostname contains `-pooler`. That's the one serverless functions should use.
3. Copy `.env.example` to `.env` and paste it:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.eu-central-1.aws.neon.tech/imt_museum?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.eu-central-1.aws.neon.tech/imt_museum?sslmode=require"
```

4. Create the tables and load the collection:

```bash
npm run db:push     # or: npm run db:generate && apply the SQL
npm run db:seed
```

5. Confirm the connection:

```bash
curl http://localhost:3000/api/health
# {"ok":true,"database":"connected"}
```

6. Restart `npm run dev`. The site now reads artworks from Postgres and
   `POST /api/orders` writes real order rows (with stock decrement) inside a
   single Neon batch transaction.

**Prefer versioned migrations?** `npm run db:generate` writes SQL to
`drizzle/migrations/`; commit that folder and apply it in CI with
`drizzle-kit migrate`.

---

## 3. Architecture

```
app/
  layout.tsx                  Fonts, metadata, header/footer, bag drawer
  page.tsx                    Home: hero → curatorial → collection → feature → visit
  artworks/[slug]/page.tsx    Catalogue entry (SSG + ISR, generateMetadata)
  checkout/page.tsx           Checkout shell
  not-found.tsx               Custom 404
  globals.css                 Design tokens (@theme), base layer, utilities
  api/
    artworks/route.ts         GET collection (?)collection= & featured=true
    cart/route.ts             GET/POST/PATCH/DELETE durable cart
    orders/route.ts           POST checkout — server-side re-pricing
    newsletter/route.ts       POST private-view signups (provider stub)
    health/route.ts           GET database connectivity

components/
  hero-carousel.tsx           Full-bleed carousel (autoplay, swipe, keyboard)
  artwork-card.tsx            Image → title → price → add-to-bag
  artwork-grid.tsx            Animated collection filter + responsive grid
  add-to-cart-button.tsx      The tactile "Added" micro-interaction
  cart-drawer.tsx             Slide-in bag with quantity controls
  checkout-form.tsx           Validation, submission, confirmation
  feature-band.tsx            Single-work editorial band ("Now on view")
  visit-band.tsx              Three-city visit information
  site-header.tsx             Scroll-aware header + full-screen mobile menu
  seal.tsx, wordmark.tsx      Brand mark + IMT / ART MUSEUM lockup
  footer.tsx                  Newsletter, links, "Made by ita"
  reveal.tsx                  Shared motion primitives (Reveal/WordReveal/DrawLine)
  marquee.tsx, section-heading.tsx, newsletter-form.tsx

public/brand/
  imt-seal.png                Seal (160px, transparent) — from assets/imtpg.png
assets/                       Logo master files (source of truth)
scripts/prepare-logo.mjs      Regenerates seal, apple-icon and favicon

lib/
  catalog.ts                  Demo catalogue (12 verified Cloudinary works)
  artworks.ts                 Single read path: Neon → fallback catalogue
  db.ts                       Lazy Neon HTTP client (optional by design)
  cart-server.ts              Cookie-token cart persistence helpers
  store/cart.ts               Zustand cart (persisted to localStorage)
  cloudinary.ts               URL transform helpers (plate/card/thumb/hero/feature)
  types.ts, utils.ts          Domain types, money formatting, cn()

drizzle/
  schema.ts                   artworks · carts · cart_items · orders · order_items
drizzle.config.ts             drizzle-kit config
scripts/seed.ts               Idempotent catalogue seed
```

### Why the database is optional

`lib/artworks.ts` is the only place that talks to the database. It prefers Neon
and falls back to `lib/catalog.ts`, so:

- a fresh clone renders a complete gallery with no configuration;
- a database outage degrades to the demo catalogue instead of a blank page;
- nothing in `components/` knows or cares which source won.

### Money

Every amount is an integer number of **cents** (`priceCents`, `totalCents`).
No floats, no rounding drift. Formatting lives in `formatPrice()`
(`lib/utils.ts`).

### Cart: client-first, server-durable

- **Live cart** — Zustand + `localStorage` (`imt-cart-v1`), so adding a work is
  instantaneous and survives refreshes. Rehydration is deferred to mount
  (`CartBoot`) to keep SSR and the first client paint identical.
- **Durable cart** — `carts` / `cart_items` in Neon, keyed by an httpOnly
  `imt_cart` cookie token. `/api/cart` is implemented and ready; the UI is
  client-authoritative today. To mirror every mutation, add one line to the
  store's `add`/`setQuantity`/`remove` actions:

```ts
void fetch("/api/cart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ artworkId, quantity }),
});
```

The routes answer `202` with a friendly message when no database is configured,
so calling them unconditionally is safe.

### Orders

`POST /api/orders` accepts **only** artwork IDs and quantities. Prices, totals
and stock are recomputed server-side from the catalogue, so a tampered payload
can choose *what* to buy but never *what to pay*. The order, its line snapshots
and the stock decrements are written in one `db.batch()` — a single transaction
on Neon's HTTP driver. Order lines are **snapshots** (title, artist, image,
price), so an archived or re-titled work never rewrites a past invoice.

---

## 4. Design system

The full palette, type scale, motion tokens and component conventions live in
[`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md). The short version:

| Token | Hex | Use |
| --- | --- | --- |
| `void` | `#050505` | Deepest ground (footer, hero) |
| `ink` | `#0b0b0b` | Primary text, dark bands |
| `graphite` | `#1a1917` | Raised dark surfaces, button hover |
| `stone` | `#8b8578` | Secondary text, wall-label metadata |
| `linen` | `#e7dfd1` | Section grounds, image placeholders |
| `bone` | `#f7f3ec` | Page ground |
| `paper` | `#fdfbf7` | Cards and the bag drawer |
| `brass` | `#b9914f` | Metal signature — "Made by ita", focus rings |
| `navy` | `#0b2d5c` | **Brand** (sampled from the seal) — eyebrow rules, active filters, bag badge, hovers |
| `navy-soft` | `#8ba6cc` | Brand on dark grounds |
| `oxblood` | `#5a2724` | Error states only |

**Type:** [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond)
(display: titles, prices, pull quotes) paired with
[Jost](https://fonts.google.com/specimen/Jost) (UI: nav, labels, body). Both via
`next/font/google`, self-hosted at build time — no layout shift, no third-party
font requests.

**Brand mark:** the museum seal lives in `public/brand/imt-seal.png` and is
worn by the header, mobile menu and footer. Its navy (`#0b2d5c`) *is* the site's
brand colour — it was sampled from the logo, so the accent reads as part of the
identity rather than decoration. On dark grounds (hero, menu, footer) the seal is
knocked out to bone with `brightness-0 invert`, which preserves the emblem's
transparent interior. Drop a new master into `assets/` and run
`node scripts/prepare-logo.mjs` to regenerate the seal, apple icon and favicon.

---

## 5. The collection & images

All 29 works live in Cloudinary (cloud `k5uefucz`) and in Neon. To re-point a
work, change its `imageUrl` in `lib/catalog.ts` and re-seed, or update the
`image_url` column in the database:

```ts
imageUrl: "https://res.cloudinary.com/<your-cloud>/image/upload/<public_id>.jpg",
```

**Pulling URLs from Cloudinary** — with `CLOUDINARY_*` set in `.env`:

```bash
node scripts/cloudinary-list.mjs
```

It walks every folder and prints each `public_id`, its dimensions, and a
ready-to-paste `imageUrl:` line for the catalogue.

`lib/cloudinary.ts` injects the right transformation per surface, so you never
hand-craft a crop:

| Variant | Transform | Used by |
| --- | --- | --- |
| `plate` | `c_limit,w_2000` | Hero plate + detail page — **never crops the work** |
| `card` | `c_fill,ar_3:4,w_1200` | Gallery cards (the studio's 3:4 format) |
| `thumb` | `c_fill,ar_1:1,w_240` | Bag lines, order summaries |
| `hero` | `c_fill,ar_3:2,w_2400` | Wide fallback crop |
| `feature` | `c_fill,ar_16:9,w_1800` | OpenGraph cards |

Studio photography is composed as a **lit plate against the ink ground** (hero)
and as a 3:4 plate on paper (cards, detail), so an object on a white ground reads
as an artwork rather than as a product cut-out. `next.config.ts` allows
`res.cloudinary.com` through `next/image`; add your host there for another CDN.

---

## 6. Payment

Checkout creates the order as `PENDING`, then opens the bank-transfer dialog
(`components/payment-dialog.tsx`): amount, order reference, bank, account name
and account number — each copyable — plus a "Notify the registrar" mailto that
pre-fills the reference. It can be reopened from the confirmation screen.

Bank details are public by nature, so they come from env and are inlined at
build time:

```bash
NEXT_PUBLIC_BANK_NAME="Your bank"
NEXT_PUBLIC_ACCOUNT_NAME="IMT ART MUSEUM LTD"
NEXT_PUBLIC_ACCOUNT_NUMBER="0123456789"
```

> The values committed in `.env.example` are placeholders. Set your real ones in
> `.env` and rebuild (`npm run build`) — `NEXT_PUBLIC_*` is baked in at build.

---

## 7. Deploy

**Vercel**

1. Push the repo and import it in Vercel.
2. Add `DATABASE_URL` (pooled) plus the `NEXT_PUBLIC_*` payment variables.
3. Deploy. Static pages (home, every `/artworks/[slug]`) regenerate hourly via
   `revalidate = 3600`; API routes are dynamic.

**Before real traffic:** add authentication for `/checkout` (or keep it as an
enquiry flow), verify incoming transfers against `orders.number`, and point
`/api/newsletter` at your email provider.

---

## 8. Verified in this build

- `npm run typecheck` — clean.
- `npm run build` — clean production build: 37 routes, all 29 artwork entries
  prerendered via `generateStaticParams`, API routes dynamic.
- `node scripts/check-images.mjs` — all 116 variants (29 works × 4 surfaces) return `200`.
- `node scripts/apply-schema.mjs` — 5 tables created in Neon; `db:seed` upserted 29 works.
- DB smoke test: `/api/health` → `connected`, `/api/artworks` → 29,
  `POST /api/orders` → `persisted: true`, an `orders` row written and stock
  decremented 1 → 0 (test order and stock then rolled back).
- Earlier route smoke test: `/`, `/artworks/[slug]`, `/checkout`, 404,
  `/api/cart`, `/api/newsletter` all behave; a tampered `priceCents` was ignored
  and the order re-priced server-side.

---

<p align="center"><strong>Made by ita</strong></p>
