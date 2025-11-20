import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as crypto from "crypto";
/*
  slugify needs to be a relative import here
 */
import { slugify } from "./utils";

const databasePath = process.env.DATABASE_PATH || "./database/sqlite3.db";
const databaseUrl = process.env.DATABASE_URL || `file:${databasePath}`;

// Create libSQL client
export const client = createClient({
  url: databaseUrl,
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

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
