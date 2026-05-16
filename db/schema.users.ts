import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`),
  username: text("username").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  password: text("password"),
  admin: integer("admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  lastAuthenticated: text("last_authenticated")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  posts: many(posts),
  journalEntries: many(journalEntries),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Import from other schema files for relations (will be resolved at runtime)
import { posts } from "./schema.posts";
import { journalEntries } from "./schema.journal";

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
