import { defineConfig } from "drizzle-kit";

const databasePath = process.env.DATABASE_PATH || "./database/sqlite3.db";
const databaseUrl = process.env.DATABASE_URL || `file:${databasePath}`;

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./database/drizzle-migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
