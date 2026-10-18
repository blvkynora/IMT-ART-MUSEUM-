/**
 * Cloudinary delivery helpers.
 *
 * Artwork URLs are hardcoded (as requested), but we never serve the raw
 * original: Cloudinary transforms are injected into the path so every
 * surface gets an appropriately sized, correctly cropped, auto-formatted
 * variant (AVIF/WebP negotiated by the CDN, not by us).
 *
 * A canonical URL looks like:
 *   https://res.cloudinary.com/<cloud>/image/upload/v1712/imt/ochre.jpg
 * and `cloudinaryUrl(url, "c_fill,ar_4:5,w_1200")` becomes:
 *   https://res.cloudinary.com/<cloud>/image/upload/c_fill,ar_4:5,w_1200/v1712/imt/ochre.jpg
 */

const UPLOAD_MARKER = "/image/upload/";

export function cloudinaryUrl(src: string, transform?: string): string {
  if (!transform) return src;

  const index = src.indexOf(UPLOAD_MARKER);
  if (index === -1) return src;

  const head = src.slice(0, index + UPLOAD_MARKER.length);
  const tail = src.slice(index + UPLOAD_MARKER.length);
  return `${head}${transform}/${tail}`;
}

const QUALITY = "q_auto:best,f_auto";

/** Named variants — one source of truth for every aspect ratio we render. */
export const variants = {
  /** Immersive hero: wide, generous, high resolution. */
  hero: (src: string) => cloudinaryUrl(src, `c_fill,ar_3:2,w_2400,${QUALITY}`),
  /** Portrait crop used by cards and thumbnails (museum-plate ratio). */
  card: (src: string) => cloudinaryUrl(src, `c_fill,ar_4:5,w_1200,${QUALITY}`),
  /** Small square crop for bag lines and thumbnails. */
  thumb: (src: string) => cloudinaryUrl(src, `c_fill,ar_1:1,w_240,${QUALITY}`),
  /** Full plate, uncropped — for zoom views and print previews. */
  plate: (src: string) => cloudinaryUrl(src, `c_limit,w_2000,${QUALITY}`),
  /**
   * Museum mount: the whole work is padded (never cropped) into a 4:5
   * plate on a warm mat, so landscape and portrait works sit identically
   * in the detail view.
   */
  mounted: (src: string) =>
    cloudinaryUrl(src, `c_pad,b_rgb:efeae1,ar_4:5,w_1800,${QUALITY}`),
  /** Editorial landscape crop for feature bands. */
  feature: (src: string) => cloudinaryUrl(src, `c_fill,ar_16:9,w_1800,${QUALITY}`),
} as const;
