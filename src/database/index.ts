import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

export * from "./schema";

// Create database client based on environment
export function createDatabaseClient(options?: {
  databaseUrl?: string;
  authToken?: string;
}) {
  // Determine URL from options, env vars, or default
  const url =
    options?.databaseUrl ||
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    `http://localhost:${process.env.DB_PORT || 8080}`;

  // Determine auth token from options or env var
  const authToken = options?.authToken || process.env.TURSO_AUTH_TOKEN;

  console.log("[Database] Creating client:", { url, hasAuthToken: !!authToken });

  // Create client with auth token if available
  const client = authToken
    ? createClient({ url, authToken })
    : createClient({ url });

  return drizzle(client, { schema });
}

// Create db instance for both local and production
export const db = createDatabaseClient();

export type Database = typeof db;

// Utility function to handle both array and ResultSet return types from .returning()
export function getResultArray<T>(result: T[] | { rows: T[] }): T[] {
  return Array.isArray(result) ? result : result.rows;
}
