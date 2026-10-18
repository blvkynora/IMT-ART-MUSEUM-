import type { Artwork } from "./types";

/**
 * ────────────────────────────────────────────────────────────────
 *  DEMO CATALOGUE
 * ────────────────────────────────────────────────────────────────
 * The site is fully functional with zero configuration: if
 * DATABASE_URL is absent, these records are served instead of Neon
 * rows. That means `npm run dev` always yields a complete gallery.
 *
 * SWAPPING IN YOUR OWN IMAGES
 * Every `imageUrl` below is a Cloudinary delivery URL. Replace the
 * cloud name (`demo`) and the public ID with your own and the whole
 * site updates — `lib/cloudinary.ts` derives the crop/size variants
 * for cards, heroes and detail plates automatically.
 *
 *   https://res.cloudinary.com/<YOUR_CLOUD>/image/upload/<PUBLIC_ID>
 *
 * The `e_art:*` segment is a Cloudinary art-transformation preset,
 * used here so the placeholder photography reads as painterly work.
 * Drop it for your own uploads.
 */
const img = (publicId: string, artPreset: string) =>
  `https://res.cloudinary.com/demo/image/upload/e_art:${artPreset}/${publicId}`;

export const catalog: Artwork[] = [
  {
    id: "art_terra_incognita",
    slug: "terra-incognita",
    title: "Terra Incognita",
    artist: "Noor Haddad",
    year: 1974,
    medium: "Oil and wax on linen",
    dimensions: "180 × 140 cm",
    description:
      "Haddad painted this ridge from memory, three winters after leaving the village of her birth. The wax keeps the light moving: what reads as a mountain at noon reads as a body at dusk.",
    imageUrl: img("mountain.jpg", "athena"),
    priceCents: 4200000,
    currency: "USD",
    edition: null,
    isFeatured: true,
    stock: 1,
    status: "AVAILABLE",
    collection: "Terra",
  },
  {
    id: "art_nocturne_atlantic",
    slug: "nocturne-atlantic",
    title: "Nocturne, Atlantic",
    artist: "Søren Lindqvist",
    year: 1988,
    medium: "Oil on canvas",
    dimensions: "150 × 190 cm",
    description:
      "One of eleven seascapes Lindqvist made the year he stopped painting daylight. The horizon sits deliberately low, so the viewer is left standing in the weather rather than looking at it.",
    imageUrl: img("samples/landscapes/nature-mountains.jpg", "sonnet"),
    priceCents: 3300000,
    currency: "USD",
    edition: null,
    isFeatured: true,
    stock: 1,
    status: "AVAILABLE",
    collection: "Nocturne",
  },
  {
    id: "art_silent_cartography",
    slug: "silent-cartography",
    title: "Silent Cartography",
    artist: "Amara Okonkwo",
    year: 1983,
    medium: "Acrylic and raw pigment on canvas",
    dimensions: "160 × 130 cm",
    description:
      "Okonkwo described her practice as 'mapping water that refuses to stay mapped'. Pigment is poured, scraped and re-poured over nine weeks until the surface holds its own current.",
    imageUrl: img("samples/landscapes/beach-boat.jpg", "incognito"),
    priceCents: 2750000,
    currency: "USD",
    edition: null,
    isFeatured: true,
    stock: 1,
    status: "AVAILABLE",
    collection: "Terra",
  },
  {
    id: "art_weight_of_light",
    slug: "the-weight-of-light",
    title: "The Weight of Light",
    artist: "Mei Kuroda",
    year: 2019,
    medium: "Oil and marble dust on panel",
    dimensions: "100 × 80 cm",
    description:
      "Kuroda's portraits are built from the outside in — light first, likeness last. Marble dust catches the gallery's own lighting, so the sitter appears to change their mind as you move past.",
    imageUrl: img("face_left.jpg", "peacock"),
    priceCents: 1850000,
    currency: "USD",
    edition: null,
    isFeatured: true,
    stock: 1,
    status: "AVAILABLE",
    collection: "Lumen",
  },
  {
    id: "art_unfinished_season",
    slug: "study-for-an-unfinished-season",
    title: "Study for an Unfinished Season",
    artist: "Rafael Duarte",
    year: 1966,
    medium: "Charcoal and gesso on cotton rag",
    dimensions: "92 × 73 cm",
    description:
      "A study that outgrew the painting it was meant to prepare. Duarte left the gesso raw at the edges, and the paper's tooth does the work that brushwork would otherwise have to.",
    imageUrl: img("samples/people/smiling-man.jpg", "audrey"),
    priceCents: 980000,
    currency: "USD",
    edition: null,
    isFeatured: false,
    stock: 1,
    status: "AVAILABLE",
    collection: "Études",
  },
  {
    id: "art_salt_cadmium",
    slug: "salt-and-cadmium",
    title: "Salt & Cadmium",
    artist: "Yara Nassar",
    year: 1993,
    medium: "Mixed media, gold leaf on board",
    dimensions: "120 × 95 cm",
    description:
      "Nassar's tabletop works are celebrations disguised as still lifes. Cadmium sits next to gold leaf as though the two had always been neighbours, and the composition refuses to apologise for it.",
    imageUrl: img("samples/food/spices.jpg", "zorro"),
    priceCents: 890000,
    currency: "USD",
    edition: null,
    isFeatured: false,
    stock: 1,
    status: "AVAILABLE",
    collection: "Lumen",
  },
  {
    id: "art_still_life_brass",
    slug: "still-life-with-brass",
    title: "Still Life with Brass",
    artist: "Ingrid Solberg",
    year: 1971,
    medium: "Oil on canvas",
    dimensions: "85 × 110 cm",
    description:
      "Solberg painted the same three objects for thirty years. This is the only canvas in which one of them is allowed to fall — she kept the mistake, and the painting was finished a week later.",
    imageUrl: img("sample.jpg", "athena"),
    priceCents: 640000,
    currency: "USD",
    edition: null,
    isFeatured: false,
    stock: 2,
    status: "AVAILABLE",
    collection: "Études",
  },
  {
    id: "art_vermilion_drift",
    slug: "vermilion-drift",
    title: "Vermilion Drift",
    artist: "Kwame Adjei",
    year: 2015,
    medium: "Acrylic on aluminium",
    dimensions: "200 × 150 cm",
    description:
      "Adjei works flat, on brushed aluminium, so no gesture can hide in the weave. Vermilion drifts across the plate in a single unhurried pass — the most confident mark in the collection.",
    imageUrl: img("cld-sample.jpg", "primavera"),
    priceCents: 1220000,
    currency: "USD",
    edition: null,
    isFeatured: false,
    stock: 1,
    status: "AVAILABLE",
    collection: "Lumen",
  },
  {
    id: "art_fractured_bloom",
    slug: "fractured-bloom",
    title: "Fractured Bloom",
    artist: "Lucía Ferrán",
    year: 2021,
    medium: "Pigment and resin on board",
    dimensions: "110 × 110 cm",
    description:
      "A bloom photographed ninety times as it opened, then rebuilt by hand from what the camera missed. Ferrán's resin surface keeps the petals permanently on the verge of falling.",
    imageUrl: img("cld-sample-3.jpg", "sonnet"),
    priceCents: 450000,
    currency: "USD",
    edition: "Edition 3 of 8",
    isFeatured: false,
    stock: 3,
    status: "AVAILABLE",
    collection: "Lumen",
  },
  {
    id: "art_tall_grass",
    slug: "among-the-tall-grass",
    title: "Among the Tall Grass",
    artist: "Anselm Rook",
    year: 2004,
    medium: "Oil on canvas",
    dimensions: "140 × 175 cm",
    description:
      "Painted across four summers from the same vantage point, this is the last of Rook's meadow cycle. Each year's growth is visible as a different density of stroke, a strata of attention.",
    imageUrl: img("samples/people/bicycle.jpg", "primavera"),
    priceCents: 1575000,
    currency: "USD",
    edition: null,
    isFeatured: false,
    stock: 1,
    status: "AVAILABLE",
    collection: "Terra",
  },
  {
    id: "art_eighth_elegy",
    slug: "eighth-elegy",
    title: "Eighth Elegy",
    artist: "Soo-ah Lim",
    year: 2022,
    medium: "Sumi ink and ash on washi",
    dimensions: "130 × 97 cm",
    description:
      "Lim made eight attempts at the same farewell; the museum acquired the eighth. Ash is fixed into the ink so the darker passages hold a grain that photographs badly and, in person, stops conversation.",
    imageUrl: img("samples/landscapes/girl-urban-view.jpg", "audrey"),
    priceCents: 2100000,
    currency: "USD",
    edition: null,
    isFeatured: false,
    stock: 1,
    status: "AVAILABLE",
    collection: "Nocturne",
  },
  {
    id: "art_small_deity",
    slug: "small-deity",
    title: "Small Deity",
    artist: "Théo Marchand",
    year: 2018,
    medium: "Oil and gold leaf on panel",
    dimensions: "60 × 48 cm",
    description:
      "Marchand paints animals the way old masters painted patrons — with unbearable seriousness and one joke buried in the gilding. Small Deity is his most collected work, and the least explained.",
    imageUrl: img("samples/animals/cat.jpg", "incognito"),
    priceCents: 380000,
    currency: "USD",
    edition: "Edition 12 of 24",
    isFeatured: false,
    stock: 6,
    status: "AVAILABLE",
    collection: "Études",
  },
];

export const catalogCollections = ["Terra", "Lumen", "Nocturne", "Études"] as const;

export const featuredArtworks = catalog.filter((artwork) => artwork.isFeatured);

export function findCatalogArtwork(slug: string): Artwork | undefined {
  return catalog.find((artwork) => artwork.slug === slug);
}
