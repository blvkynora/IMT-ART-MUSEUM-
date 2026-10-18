# IMT ART MUSEUM — Design System

> The brief was "jaw-dropping, luxury, artistic". Luxury is not ornament. It is
> **restraint, proportion and restraint again**: one accent colour, two type
> families, one easing curve, and enough whitespace to make each work feel like
> it is hanging alone on a wall.

Everything below is implemented as tokens in `app/globals.css` (`@theme`), so a
change there propagates through the entire site.

---

## 1. Palette — "Bone & Brass"

Nine values. That's the whole system.

| Token | Hex | Role |
| --- | --- | --- |
| `void` | `#050505` | Deepest ground — footer, hero fallback |
| `ink` | `#0b0b0b` | Primary type; the dark gallery-band surface |
| `graphite` | `#1a1917` | Raised dark surface, hover state for ink buttons |
| `slate` | `#2a2825` | Long-form body copy on light grounds |
| `stone` | `#8b8578` | Wall-label metadata, secondary type |
| `linen` | `#e7dfd1` | Section grounds, image placeholders, quote band |
| `bone` | `#f7f3ec` | **Page ground** — warm paper, never pure white |
| `paper` | `#fdfbf7` | Cards, bag drawer, checkout summary |
| `brass` | `#b9914f` | **Metal signature.** "Made by ita", focus rings. Nothing else |
| `navy` | `#0b2d5c` | **Brand** — sampled from the seal. Wayfinding rules, active states, badges, hover |
| `navy-soft` | `#8ba6cc` | Brand on dark grounds |
| `oxblood` | `#5a2724` | Errors. Nothing else, ever |

**Why it works**

- `bone` instead of `#fff` removes the screen glare that makes "clean" sites
  feel cheap. Warm ground + cool-neutral type reads as printed matter.
- **Two accents, clearly ranked.** Navy (the seal's own colour) does the
  wayfinding: the 1px rule before every eyebrow, the active collection pill, the
  bag badge, hover on artwork titles. Brass is the metal signature — reserved
  for the studio line in the footer and the focus ring, where warmth reads as
  craftsmanship rather than brand. Combined, the two never cover more than ~3%
  of a screen, so the eye always knows where to go.
- Dark bands (`ink`, `void`) are used as *punctuation* between light sections,
  the way a gallery uses a dark room for a single luminous work.

**Contrast (computed, WCAG 2.1)**

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `ink` on `bone` | 17.8:1 | AAA |
| `slate` on `bone` | 13.3:1 | AAA (long-form body copy) |
| `stone` on `bone` | 3.3:1 | AA Large — labels ≥ 11px uppercase only |
| `bone` on `ink` | 17.8:1 | AAA |
| `navy` on `bone` | 12.3:1 | AAA |
| `navy-soft` on `ink` | 7.9:1 | AAA |
| `brass` on `ink` | 6.8:1 | AA |
| `brass` on `bone` | 2.6:1 | **fails** — brass is never used as text on a light ground |

---

## 2. The brand mark

The museum's seal (`assets/imtpg.png` → `public/brand/imt-seal.png`) is a
circular emblem in **deep navy `#0b2d5c` and ink `#020202`, on a transparent
background** — the palette's navy was sampled directly from it, which is why the
brand colour never looks applied on top of the design; it comes out of it.

| Use | Treatment |
| --- | --- |
| Header on `bone` (scrolled, inner pages) | Seal in true brand colours |
| Header floating over the hero | Knocked out: `brightness-0 invert opacity-90` |
| Mobile menu, footer | Knocked out, same treatment |

The knock-out works because the mark contains **no white pixels** — its light
areas are transparent, so a luminance knock-out turns every filled shape bone
and leaves the emblem's interior cut-outs intact.

The seal is 36px (mobile) / 40px (desktop), always paired with the `IMT /
ART MUSEUM` type lockup. It is decorative (`alt=""`) because the link is already
labelled, so screen readers hear the institution once.

`scripts/prepare-logo.mjs` regenerates the derivatives from a new source file:
seal PNG (160px, ~18kB), `app/apple-icon.png` and `app/favicon.ico`.

---

## 3. Typography

Two families, and a strict division of labour.

### Display — Cormorant Garamond

`--font-display` · weights 300/400/500/600 + italics · Google Fonts, self-hosted
via `next/font`.

A high-contrast Garamond revival: hairline serifs, dramatic thick/thin, an
italic that behaves like real engraving. This is the museum's voice.

- **Used for:** artwork titles, section headlines, prices, pull quotes, artist
  names (italic), the oversized footer signature.
- **Rules:** weight 300 or 400 only. Tracking `-0.015em` to `-0.02em` on
  headlines, positive `0.26em` on the wordmark. Line-height `0.92–1.05` for
  display, `1.25–1.35` for pull quotes. Never below 18px.
- **Never** use it for UI controls, form labels, or body copy.

### UI — Jost

`--font-sans` · variable · Google Fonts, self-hosted.

A Futura revival — geometric, quiet, unmistakably Bauhaus. It carries the
museum's signage.

- **Used for:** navigation, buttons, labels, body copy, forms, numbers.
- **Rules:** body weight 300; `--font-sans` is the default `body` family.
- **Labels:** `.label-caps` (11px / `0.22em` / uppercase) and `.label-caps-sm`
  (10px / `0.26em`). These two utilities are the entire "wall label" language of
  the site — wide tracking is what makes them read as institutional rather than
  as UI chrome.

### Scale in use

| Context | Size |
| --- | --- |
| Hero title | `clamp(2.7rem, 7.4vw, 6.5rem)` |
| Section headline | `clamp(2.1rem, 4.6vw, 3.75rem)` |
| Detail title | `clamp(2.3rem, 5vw, 3.9rem)` |
| Card title | `1.4rem` |
| Price | `1.25rem` – `2.5rem`, always `tabular-nums` |
| Body | `0.95rem / 1.75` |
| Label | `0.6875rem / 0.22em` |

Prices, quantities and counters carry `tabular-nums` (or the `.tnum` utility in
`globals.css`) so digits never shift width mid-animation.

---

## 4. Space & layout

- **Shell** — `.shell`: `max-width: 88rem`, gutters `1.25rem → 2.5rem → 3.5rem`
  across breakpoints. One class, used everywhere; horizontal rhythm is never
  improvised.
- **Section rhythm** — `py-20` mobile, `py-28` desktop. Gaps between content
  blocks are generous by design: `gap-y-14` in the grid, `gap-12`–`gap-20` in
  editorial splits.
- **Grid** — collection: 1 column → 2 (`sm`) → 3 (`lg`) at `gap-x-8 gap-y-16`.
- **Measure** — body copy capped at `max-w-prose` / `max-w-xl` (~65ch). Display
  headlines capped at `max-w-4xl`.

---

## 5. Motion

Motion tokens live in `@theme` as CSS easings and are mirrored in components.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-luxe` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default. Fast out, long settle. |
| `--ease-veil` | `cubic-bezier(0.65, 0, 0.35, 1)` | Drawer/curtain exits |
| `--ease-swift` | `cubic-bezier(0.4, 0, 0.2, 1)` | Small state changes |

**Durations**

| Interaction | Duration |
| --- | --- |
| Colour / opacity hover | 500 ms |
| Card image zoom | 1250 ms |
| Hero cross-fade | 1500 ms |
| Scroll reveal | 900–1000 ms |
| Drawer slide | 650 ms |
| Button press | 280 ms + `scale: 0.975` |

**Principles**

1. **Long, never sluggish.** 500–1500 ms is the luxury band. Under 300 ms feels
   like a utility app; over 2 s feels broken.
2. **Reveal, don't announce.** Entrances are opacity + ≤ 28px of travel. No
   bounce, no spring overshoot, no parallax gimmicks.
3. **Masked type.** `WordReveal` lifts each word out of an overflow-hidden line
   with a 55 ms stagger — letterpress, not template.
4. **The image leads the copy.** In the hero the photograph settles first; text
   follows by ~120 ms.
5. **Respect the user.** Every animated component calls `useReducedMotion()` and
   drops travel/autoplay. The CSS `.animate-*` utilities are disabled inside
   `prefers-reduced-motion`.

---

## 6. Elevation

Two shadows, both barely there. Luxury is illumination quality, not drop
shadows.

```css
--shadow-frame: 0 1px 2px rgba(11,11,11,.04), 0 12px 32px -12px rgba(11,11,11,.16);
--shadow-lift:  0 2px 6px rgba(11,11,11,.05), 0 32px 64px -24px rgba(11,11,11,.28);
--shadow-drawer: -32px 0 80px -32px rgba(11,11,11,.45);
```

Cards do not lift. The bag drawer and its backdrop are the only elevated
surfaces in the product.

---

## 7. Component conventions

### Buttons

- **Primary (acquire)** — filled `ink`, `bone` label, `.label-caps`, hover to
  `graphite`, trailing arrow translates 4px on hover.
- **Secondary (ghost)** — 1px `currentColor/25` border, fills with `ink` on
  hover. Used for "Add to bag".
- **Text link** — `.rule-reveal`: a 1px rule growing from the left over 550 ms.
- All buttons share `whileTap scale: 0.975`; nothing else bounces.

### Artwork card

Fixed reading order, matching how a wall label is written:

```
[ 4:5 plate ]        ← hover: 5.5% zoom + hairline frame + corner arrow
collection · year    ← label-caps-sm, stone
Title                ← display serif, 1.4rem
Artist               ← 14px, stone
──────────────────
Price        [Add]   ← tabular serif price, ghost button
Medium
```

### Dividers

`1px` at 12% `ink` on light grounds (`.hairline`), 18% `bone` on dark
(`.hairline-light`). Dividers are literal rules, never gradients.

### Forms

Underline-only fields (`border-b`), label in `.label-caps-sm` above, focus moves
the underline to `ink` — no boxes, no shadows, no rounded corners.

### Imagery

- Cards crop to **4:5** (the standard museum plate ratio).
- The detail page **never crops**: `mounted` pads the full work onto a warm mat,
  so landscape and portrait works sit identically.
- Fine film grain (`.grain`) sits over hero and dark bands at 22% opacity,
  `mix-blend-mode: overlay` — invisible up close, tangible in aggregate.

---

## 8. Accessibility

- Visible focus: 2px `brass` outline with 3px offset, on every interactive element.
- Skip link to `#main`.
- The carousel: `aria-roledescription="carousel"`, arrow-key support, swipe,
  `aria-live` slide announcements, autoplay paused on hover **and** focus.
- The bag drawer: `role="dialog"`, `aria-modal`, Escape to close, focus moved to
  the close button, body scroll locked.
- Collection filters are a real `tablist`; the grid announces its visible count.
- Colour is never the only carrier of meaning (sold works also carry a text badge).

---

## 9. Do / Don't

| Do | Don't |
| --- | --- |
| One accent, used sparingly | Introduce a second accent "just here" |
| Warm `bone` ground | `#ffffff` grounds |
| 500 ms+ transitions with `ease-luxe` | Springs, bounces, 150 ms fades |
| Wide-tracked small caps for labels | Bold condensed caps |
| Let whitespace separate sections | Cards with borders + shadows + radii |
| Serif for titles, geometric sans for UI | Serif everywhere |
| Crop cards, never crop the detail plate | Distort or stretch artwork |
