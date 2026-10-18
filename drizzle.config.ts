import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * `drizzle-kit` reads this file for `generate`, `push` and `studio`.
 * Use the POOLED Neon hostname for the app, but a direct connection
 * is fine (and often faster) for migrations.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
