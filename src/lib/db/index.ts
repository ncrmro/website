import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import * as schema from './schema';

/**
 * Slugify text for URL-safe strings
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

/**
 * Create SQLite database (in-memory for now)
 */
const databasePath = process.env.DATABASE_PATH || ':memory:';
export const sqlite = new Database(databasePath);

/**
 * Configure SQLite
 */
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

/**
 * Register custom SQLite functions
 * These match the functions from the original Kysely setup
 */

// regexp(regex, text) - Full regex support in SQL queries
sqlite.function('regexp', { deterministic: true }, (regex, text) =>
  new RegExp(regex as string).test(text as string) ? 1 : 0
);

// uuid() - Generate UUIDs in database
sqlite.function('uuid', () => crypto.randomUUID());

// slugify(text) - Convert titles to URL-safe slugs
sqlite.function('slugify', { deterministic: true }, (text) => {
  if (typeof text !== 'string') throw new Error('Argument was not a string');
  return slugify(text);
});

/**
 * Drizzle database instance
 */
export const db = drizzle(sqlite, { schema });

/**
 * Export schema and utilities
 */
export * from './schema';
export { sql } from 'drizzle-orm';
