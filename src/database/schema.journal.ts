import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./schema.users";

export const journalEntries = sqliteTable(
  "journal_entries",
  {
    id: text("id")
      .primaryKey()
      .default(sql`(uuid())`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    // Unix timestamp for the date (seconds since epoch)
    createdDate: integer("created_date")
      .notNull()
      .default(sql`(strftime('%s', CURRENT_DATE))`),
    // Unix timestamps for created/updated
    createdAt: integer("created_at")
      .notNull()
      .default(sql`(strftime('%s', CURRENT_TIMESTAMP))`),
    updatedAt: integer("updated_at")
      .notNull()
      .default(sql`(strftime('%s', CURRENT_TIMESTAMP))`),
  },
  (table) => [
    uniqueIndex("journal_entries_user_date").on(table.userId, table.createdDate),
  ]
);

export const journalEntryHistory = sqliteTable("journal_entry_history", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`),
  journalEntryId: text("journal_entry_id")
    .notNull()
    .references(() => journalEntries.id),
  body: text("body").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', CURRENT_TIMESTAMP))`),
});

// Relations
export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  history: many(journalEntryHistory),
}));

export const journalEntryHistoryRelations = relations(
  journalEntryHistory,
  ({ one }) => ({
    journalEntry: one(journalEntries, {
      fields: [journalEntryHistory.journalEntryId],
      references: [journalEntries.id],
    }),
  })
);

// Types
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryHistory = typeof journalEntryHistory.$inferSelect;
export type NewJournalEntryHistory = typeof journalEntryHistory.$inferInsert;
