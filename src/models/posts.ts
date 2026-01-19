import { db, posts, tags, postsTags, journalEntries } from "@/database";
import { eq, like, or, desc, count, and, sql } from "drizzle-orm";

export interface PostFilters {
  search?: string;
  published?: boolean | "all";
  tagId?: string;
  page?: number;
}

export interface PaginatedPosts {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    body: string | null;
    publishDate: string | null;
    published: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

const POSTS_PER_PAGE = 100;

export async function getPaginatedPosts(
  filters: PostFilters = {}
): Promise<PaginatedPosts> {
  const { search, published = "all", tagId, page = 1 } = filters;

  // Build conditions array
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(posts.title, `%${search}%`),
        like(posts.description, `%${search}%`),
        like(posts.body, `%${search}%`)
      )
    );
  }

  if (published !== "all") {
    conditions.push(eq(posts.published, published));
  }

  // Get total count using a simpler approach
  let total = 0;
  if (tagId) {
    const countResult = await db
      .select({ count: count() })
      .from(posts)
      .innerJoin(postsTags, eq(posts.id, postsTags.postId))
      .where(
        conditions.length > 0
          ? and(eq(postsTags.tagId, tagId), ...conditions)
          : eq(postsTags.tagId, tagId)
      );
    total = countResult[0]?.count ?? 0;
  } else if (conditions.length > 0) {
    const countResult = await db
      .select({ count: count() })
      .from(posts)
      .where(and(...conditions));
    total = countResult[0]?.count ?? 0;
  } else {
    const countResult = await db.select({ count: count() }).from(posts);
    total = countResult[0]?.count ?? 0;
  }

  // Get posts with pagination
  const offset = (page - 1) * POSTS_PER_PAGE;

  const selectFields = {
    id: posts.id,
    slug: posts.slug,
    title: posts.title,
    description: posts.description,
    body: posts.body,
    publishDate: posts.publishDate,
    published: posts.published,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
  };

  let postsResult;
  if (tagId) {
    postsResult = await db
      .select(selectFields)
      .from(posts)
      .innerJoin(postsTags, eq(posts.id, postsTags.postId))
      .where(
        conditions.length > 0
          ? and(eq(postsTags.tagId, tagId), ...conditions)
          : eq(postsTags.tagId, tagId)
      )
      .orderBy(desc(posts.publishDate))
      .limit(POSTS_PER_PAGE)
      .offset(offset);
  } else if (conditions.length > 0) {
    postsResult = await db
      .select(selectFields)
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.publishDate))
      .limit(POSTS_PER_PAGE)
      .offset(offset);
  } else {
    postsResult = await db
      .select(selectFields)
      .from(posts)
      .orderBy(desc(posts.publishDate))
      .limit(POSTS_PER_PAGE)
      .offset(offset);
  }

  return {
    posts: postsResult,
    pagination: {
      page,
      perPage: POSTS_PER_PAGE,
      total,
      totalPages: Math.ceil(total / POSTS_PER_PAGE),
    },
  };
}

export async function getAllTags() {
  return await db
    .select({ id: tags.id, value: tags.value })
    .from(tags)
    .orderBy(tags.value);
}

export async function getRecentPosts(limit: number = 3) {
  return await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      publishDate: posts.publishDate,
      published: posts.published,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt))
    .limit(limit);
}

export async function getRecentJournalEntries(userId: string, limit: number = 3) {
  return await db
    .select({
      id: journalEntries.id,
      body: journalEntries.body,
      createdDate: journalEntries.createdDate,
    })
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdDate))
    .limit(limit);
}
