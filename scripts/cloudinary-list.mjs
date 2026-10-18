// List every image in the Cloudinary cloud and print ready-to-paste catalogue URLs.
//   node scripts/cloudinary-list.mjs
import "dotenv/config";

const cloud = process.env.CLOUDINARY_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_SECRET_KEY;

if (!cloud || !key || !secret) {
  console.error("Missing CLOUDINARY_* values in .env");
  process.exit(1);
}

const auth = Buffer.from(`${key}:${secret}`).toString("base64");
const get = async (path) => {
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}${path}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${json?.error?.message ?? "unknown"}`);
  return json;
};

// Root listing misses assets inside folders, so walk every folder too.
const images = new Map();
async function collect(prefix) {
  let cursor;
  do {
    const q = new URLSearchParams({ max_results: "500", type: "upload" });
    if (prefix) q.set("prefix", prefix);
    if (cursor) q.set("next_cursor", cursor);
    const page = await get(`/resources/image?${q}`);
    for (const img of page.resources) images.set(img.public_id, img);
    cursor = page.next_cursor;
  } while (cursor);
}

await collect();
const { folders = [] } = await get("/folders");
for (const folder of folders) await collect(folder.path);

const list = [...images.values()].sort((a, b) => a.public_id.localeCompare(b.public_id));

console.log(`cloud: ${cloud} · ${list.length} image(s)\n`);

for (const img of list) {
  console.log(`${img.public_id}  ${img.width}x${img.height}  ${img.format}  ${Math.round(img.bytes / 1024)}kB`);
}

if (list.length) {
  console.log("\n--- paste into lib/catalog.ts `imageUrl` fields ---");
  for (const img of list) {
    console.log(`imageUrl: "https://res.cloudinary.com/${cloud}/image/upload/${img.public_id}.${img.format}",`);
  }
}
