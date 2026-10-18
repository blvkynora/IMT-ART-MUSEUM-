// Verify every Cloudinary URL in the catalogue resolves, in all rendered variants.
//   node scripts/check-images.mjs
import { readFile } from "node:fs/promises";

const source = await readFile("lib/catalog.ts", "utf8");
const ids = [...source.matchAll(/imageUrl:\s*img\("([^"]+)"\)/g)].map((m) => m[1]);

if (ids.length === 0) {
  console.error("No img(...) URLs found in lib/catalog.ts");
  process.exit(1);
}

const CLOUD = "https://res.cloudinary.com/k5uefucz/image/upload";
const VARIANTS = {
  card: "c_fill,ar_4:5,w_1200,q_auto:best,f_auto",
  hero: "c_fill,ar_3:2,w_2400,q_auto:best,f_auto",
  thumb: "c_fill,ar_1:1,w_240,q_auto:best,f_auto",
  plate: "c_limit,w_2000,q_auto:best,f_auto",
};

const failures = [];

for (const id of ids) {
  const parts = [];
  for (const [name, transform] of Object.entries(VARIANTS)) {
    const url = `${CLOUD}/${transform}/${id}.jpg`;
    try {
      let res = await fetch(url, { method: "HEAD" });
      if (!res.ok) res = await fetch(url);
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.startsWith("image/")) {
        failures.push(`${name}: HTTP ${res.status} (${type}) ${id}`);
        parts.push(`${name}=FAIL`);
      } else {
        parts.push(
          `${name}=${Math.round(Number(res.headers.get("content-length") || 0) / 1024)}kB`,
        );
      }
    } catch (err) {
      failures.push(`${name}: ${err.message} ${id}`);
      parts.push(`${name}=ERR`);
    }
  }
  console.log(`${id.padEnd(56)} ${parts.join("  ")}`);
}

console.log(`\nartworks: ${ids.length}  variants checked: ${ids.length * 4}`);
if (failures.length) {
  console.error(`\nFAILURES (${failures.length}):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("All variants OK.");
