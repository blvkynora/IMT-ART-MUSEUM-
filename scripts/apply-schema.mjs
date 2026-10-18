// Apply drizzle/migrations/0000_init.sql to Neon without the drizzle-kit CLI.
// Useful where the CLI cannot spawn a child process (sandboxes, locked CI).
//   node scripts/apply-schema.mjs
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(url);
const source = await readFile("drizzle/migrations/0000_init.sql", "utf8");

// Statements are separated by blank lines, so dollar-quoted DO blocks stay intact.
const statements = source
  .split(/\n\s*\n/)
  .map((chunk) => chunk.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);

let applied = 0;

for (const statement of statements) {
  try {
    // Raw string execution (not a tagged template) needs `.query`.
    await sql.query(statement);
    applied++;
  } catch (error) {
    console.error(`\nFailed statement:\n${statement.slice(0, 160)}…\n`);
    console.error(error.message);
    process.exit(1);
  }
}

const tables = await sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
  order by table_name
`;

console.log(`✓ applied ${applied} statement(s)`);
console.log(`  tables: ${tables.map((t) => t.table_name).join(", ")}`);
