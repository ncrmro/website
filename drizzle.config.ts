import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  ...(process.env.TURSO_AUTH_TOKEN
    ? {
        dialect: "turso",
        dbCredentials: {
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }
    : {
        dialect: "sqlite",
        dbCredentials: {
          url:
            process.env.DATABASE_URL ||
            `http://localhost:${process.env.DB_PORT || 8080}`,
        },
      }),
});
