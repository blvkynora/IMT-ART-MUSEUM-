// Throwaway: produce web-optimised derivatives of the supplied logo.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

await mkdir("public/brand", { recursive: true });

const source = "assets/imtpg.png";

// Header lockup asset: trimmed, 160px (2x for a 40px display box).
const trimmed = await sharp(source)
  .trim({ threshold: 10 })
  .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, effort: 10, palette: true, colours: 64 })
  .toBuffer();

await sharp(trimmed).toFile("public/brand/imt-seal.png");

// Apple touch icon: 180x180, opaque bone ground (iOS ignores alpha).
await sharp(source)
  .trim({ threshold: 10 })
  .resize(150, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
    background: { r: 247, g: 243, b: 236, alpha: 1 },
  })
  .flatten({ background: "#f7f3ec" })
  .png()
  .toFile("app/apple-icon.png");

const meta = await sharp("public/brand/imt-seal.png").metadata();
console.log(`seal: ${meta.width}x${meta.height} ${meta.channels}ch alpha=${meta.hasAlpha}`);
