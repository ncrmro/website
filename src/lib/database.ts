import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import * as crypto from "crypto";
/*
  slugify needs to be a relative import here
 */
import { slugify } from "./utils";

const databasePath = process.env.DATABASE_PATH || "./database/sqlite3.db";

// Create better-sqlite3 connection with WAL mode
const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON;");

// Register custom SQL functions for compatibility
sqlite.function("regexp", { deterministic: true }, (regex, text) =>
  new RegExp(regex as string).test(text as string) ? 1 : 0
);
sqlite.function("uuid", () => crypto.randomUUID());
sqlite.function("slugify", { deterministic: true }, (text) => {
  if (typeof text !== "string") throw new Error("Argument was not a string");
  return slugify(text);
});

// Create Drizzle ORM instance with better-sqlite3
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite client for migrations
export const client = sqlite;

// Helper functions that were previously SQL functions
export function regexpMatch(regex: string, text: string): boolean {
  return new RegExp(regex).test(text);
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function slugifyText(text: string): string {
  if (typeof text !== "string") throw new Error("Argument was not a string");
  return slugify(text);
}

// For backward compatibility with imports
export { sql } from "drizzle-orm";
