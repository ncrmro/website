import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import { eq, and, or, like, desc, sql, count } from "drizzle-orm";

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
    body: string;
    publish_date: string | null;
    published: boolean;
    created_at: string;
    updated_at: string;
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
  const {
    search,
    published = "all",
    tagId,
    page = 1,
  } = filters;

  // Build WHERE conditions
  const conditions = [];
  
  if (search) {
    conditions.push(
      or(
        like(schema.posts.title, `%${search}%`),
        like(schema.posts.description, `%${search}%`),
        like(schema.posts.body, `%${search}%`)
      )
    );
  }

  if (published !== "all") {
    conditions.push(eq(schema.posts.published, published));
  }

  // Get posts with tag filtering
  let posts;
  if (tagId) {
    posts = await db
      .select({
        id: schema.posts.id,
        slug: schema.posts.slug,
        title: schema.posts.title,
        description: schema.posts.description,
        body: schema.posts.body,
        publish_date: schema.posts.publish_date,
        published: schema.posts.published,
        created_at: schema.posts.created_at,
        updated_at: schema.posts.updated_at,
      })
      .from(schema.posts)
      .innerJoin(schema.posts_tags, eq(schema.posts.id, schema.posts_tags.post_id))
      .where(and(
        eq(schema.posts_tags.tag_id, tagId),
        ...(conditions.length > 0 ? [and(...conditions)!] : [])
      ))
      .orderBy(desc(schema.posts.publish_date))
      .limit(POSTS_PER_PAGE)
      .offset((page - 1) * POSTS_PER_PAGE);
  } else {
    const queryWithConditions = conditions.length > 0
      ? db
          .select({
            id: schema.posts.id,
            slug: schema.posts.slug,
            title: schema.posts.title,
            description: schema.posts.description,
            body: schema.posts.body,
            publish_date: schema.posts.publish_date,
            published: schema.posts.published,
            created_at: schema.posts.created_at,
            updated_at: schema.posts.updated_at,
          })
          .from(schema.posts)
          .where(and(...conditions)!)
      : db
          .select({
            id: schema.posts.id,
            slug: schema.posts.slug,
            title: schema.posts.title,
            description: schema.posts.description,
            body: schema.posts.body,
            publish_date: schema.posts.publish_date,
            published: schema.posts.published,
            created_at: schema.posts.created_at,
            updated_at: schema.posts.updated_at,
          })
          .from(schema.posts);
    
    posts = await queryWithConditions
      .orderBy(desc(schema.posts.publish_date))
      .limit(POSTS_PER_PAGE)
      .offset((page - 1) * POSTS_PER_PAGE);
  }

  // Get total count
  let total;
  if (tagId) {
    const countResult = await db
      .select({ count: count() })
      .from(schema.posts)
      .innerJoin(schema.posts_tags, eq(schema.posts.id, schema.posts_tags.post_id))
      .where(and(
        eq(schema.posts_tags.tag_id, tagId),
        ...(conditions.length > 0 ? [and(...conditions)!] : [])
      ));
    total = countResult[0]?.count ?? 0;
  } else {
    const countQuery = conditions.length > 0
      ? db
          .select({ count: count() })
          .from(schema.posts)
          .where(and(...conditions)!)
      : db
          .select({ count: count() })
          .from(schema.posts);
    
    const countResult = await countQuery;
    total = countResult[0]?.count ?? 0;
  }

  return {
    posts,
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
    .select({
      id: schema.tags.id,
      value: schema.tags.value,
    })
    .from(schema.tags)
    .orderBy(schema.tags.value);
}

export async function getRecentPosts(limit: number = 3) {
  return await db
    .select({
      id: schema.posts.id,
      slug: schema.posts.slug,
      title: schema.posts.title,
      description: schema.posts.description,
      publish_date: schema.posts.publish_date,
      published: schema.posts.published,
      updated_at: schema.posts.updated_at,
    })
    .from(schema.posts)
    .orderBy(desc(schema.posts.updated_at))
    .limit(limit);
}

export async function getRecentJournalEntries(userId: string, limit: number = 3) {
  return await db
    .select({
      id: schema.journal_entries.id,
      body: schema.journal_entries.body,
      created_date: schema.journal_entries.created_date,
    })
    .from(schema.journal_entries)
    .where(eq(schema.journal_entries.user_id, userId))
    .orderBy(desc(schema.journal_entries.created_date))
    .limit(limit);
}
