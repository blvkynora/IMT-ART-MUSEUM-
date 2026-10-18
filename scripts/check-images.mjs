// Throwaway: confirm every derived Cloudinary variant in the catalogue is served.
import { readFile } from "node:fs/promises";

const source = await readFile("lib/catalog.ts", "utf8");
const matches = [...source.matchAll(/img\("([^"]+)",\s*"([^"]+)"\)/g)];

if (matches.length === 0) {
  console.error("No artwork image URLs found — check lib/catalog.ts");
  process.exit(1);
}

const VARIANTS = {
  card: "c_fill,ar_4:5,w_1200,q_auto:best,f_auto",
  hero: "c_fill,ar_3:2,w_2400,q_auto:best,f_auto",
  thumb: "c_fill,ar_1:1,w_240,q_auto:best,f_auto",
  plate: "c_limit,w_2000,q_auto:best,f_auto",
};

const build = (publicId, preset, transform) =>
  `https://res.cloudinary.com/demo/image/upload/${transform}/e_art:${preset}/${publicId}`;

const failures = [];
const sizes = [];

for (const [, publicId, preset] of matches) {
  const line = [`${publicId} [${preset}]`];
  for (const [name, transform] of Object.entries(VARIANTS)) {
    const url = build(publicId, preset, transform);
    try {
      let res = await fetch(url, { method: "HEAD" });
      if (!res.ok) res = await fetch(url, { method: "GET" });
      const type = res.headers.get("content-type") || "";
      const len = Number(res.headers.get("content-length") || 0);
      if (!res.ok || !type.startsWith("image/")) {
        failures.push(`${name}: HTTP ${res.status} ${type} ${url}`);
        line.push(`${name}=FAIL(${res.status})`);
      } else {
        sizes.push(len);
        line.push(`${name}=${Math.round(len / 1024)}kB`);
      }
    } catch (err) {
      failures.push(`${name}: ${err.message} ${url}`);
      line.push(`${name}=ERR`);
    }
  }
  console.log(line.join("  "));
}

console.log(`\nartworks: ${matches.length}  variants checked: ${matches.length * 4}`);
console.log(`median payload: ${Math.round(sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)] / 1024)} kB`);
if (failures.length) {
  console.error(`\nFAILURES (${failures.length}):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("All variants OK.");
