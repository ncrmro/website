import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { users } from './schema.auth';

/**
 * Blog schema for posts, tags, and their relationships
 */

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  value: text('value').notNull().unique(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().unique(),
    body: text('body').notNull(),
    description: text('description').notNull(),
    slug: text('slug').notNull().unique(),
    published: integer('published', { mode: 'boolean' }).default(false).notNull(),
    publishDate: text('publish_date'),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  },
  (table) => ({
    userIdx: index('posts_user_idx').on(table.userId),
    publishedIdx: index('posts_published_idx').on(table.published),
  }),
);

export const postsTags = sqliteTable('posts_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
});

// Type exports
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostTag = typeof postsTags.$inferSelect;
export type NewPostTag = typeof postsTags.$inferInsert;
