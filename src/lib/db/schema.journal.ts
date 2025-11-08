import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './schema.auth';

/**
 * Journal schema for daily entries and their history
 */

export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdDate: integer('created_date', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', CURRENT_DATE))`),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', CURRENT_TIMESTAMP))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', CURRENT_TIMESTAMP))`),
});

export const journalEntryHistory = sqliteTable('journal_entry_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  journalEntryId: integer('journal_entry_id')
    .notNull()
    .references(() => journalEntries.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', CURRENT_TIMESTAMP))`),
});

// Type exports
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryHistory = typeof journalEntryHistory.$inferSelect;
export type NewJournalEntryHistory = typeof journalEntryHistory.$inferInsert;
