import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Custom SQL functions for compatibility
export const uuid = sql`(uuid())`;
export const currentTimestamp = sql`CURRENT_TIMESTAMP`;

// Users table
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  username: text("username").unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  password: text("password").notNull(),
  admin: integer("admin", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at")
    .notNull()
    .default(currentTimestamp),
  updated_at: text("updated_at")
    .notNull()
    .default(currentTimestamp),
});

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  last_authenticated: text("last_authenticated")
    .notNull()
    .default(currentTimestamp),
  created_at: text("created_at")
    .notNull()
    .default(currentTimestamp),
  updated_at: text("updated_at")
    .notNull()
    .default(currentTimestamp),
});

// Tags table
export const tags = sqliteTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  value: text("value").notNull().unique(),
  created_at: text("created_at")
    .notNull()
    .default(currentTimestamp),
  updated_at: text("updated_at")
    .notNull()
    .default(currentTimestamp),
});

// Posts table
export const posts = sqliteTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull().unique(),
    body: text("body").notNull(),
    description: text("description").notNull(),
    slug: text("slug").notNull().unique(),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    publish_date: text("publish_date"),
    created_at: text("created_at")
      .notNull()
      .default(currentTimestamp),
    updated_at: text("updated_at")
      .notNull()
      .default(currentTimestamp),
  },
  (table) => ({
    userIdx: index("posts_user").on(table.user_id),
    publishedIdx: index("posts_published").on(table.published),
  })
);

// Posts-Tags junction table
export const posts_tags = sqliteTable("posts_tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  post_id: text("post_id")
    .notNull()
    .references(() => posts.id),
  tag_id: text("tag_id")
    .notNull()
    .references(() => tags.id),
});

// Journal entries table
export const journal_entries = sqliteTable("journal_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  created_date: integer("created_date", { mode: "number" })
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
  created_at: integer("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
  updated_at: integer("updated_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Journal entry history table
export const journal_entry_history = sqliteTable("journal_entry_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  journal_entry_id: text("journal_entry_id")
    .notNull()
    .references(() => journal_entries.id),
  body: text("body").notNull(),
  created_at: integer("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Migrations table (for migration tracking)
export const migrations = sqliteTable("migrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull().unique(),
  sha: text("sha").notNull().unique(),
  created_at: text("created_at")
    .notNull()
    .default(currentTimestamp),
  updated_at: text("updated_at")
    .notNull()
    .default(currentTimestamp),
});

// Type exports for use in queries
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type PostTag = typeof posts_tags.$inferSelect;
export type NewPostTag = typeof posts_tags.$inferInsert;
export type JournalEntry = typeof journal_entries.$inferSelect;
export type NewJournalEntry = typeof journal_entries.$inferInsert;
export type JournalEntryHistory = typeof journal_entry_history.$inferSelect;
export type NewJournalEntryHistory = typeof journal_entry_history.$inferInsert;
export type Migration = typeof migrations.$inferSelect;
export type NewMigration = typeof migrations.$inferInsert;
