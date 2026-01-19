import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./schema.users";

export const tags = sqliteTable("tags", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`),
  value: text("value").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const posts = sqliteTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .default(sql`(uuid())`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull().unique(),
    body: text("body").default(""),
    description: text("description").notNull(),
    slug: text("slug").notNull().unique(),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    publishDate: text("publish_date"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("posts_user").on(table.userId),
    index("posts_published").on(table.published),
  ]
);

export const postsTags = sqliteTable(
  "posts_tags",
  {
    id: text("id")
      .primaryKey()
      .default(sql`(uuid())`),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (table) => [uniqueIndex("posts_tags_unique").on(table.postId, table.tagId)]
);

// Relations
export const tagsRelations = relations(tags, ({ many }) => ({
  postsTags: many(postsTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  postsTags: many(postsTags),
}));

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsTags.tagId],
    references: [tags.id],
  }),
}));

// Types
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostTag = typeof postsTags.$inferSelect;
export type NewPostTag = typeof postsTags.$inferInsert;
