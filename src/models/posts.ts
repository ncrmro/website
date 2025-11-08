import { db, posts, tags, postsTags, journalEntries } from "@/lib/db";
import { eq, like, or, and, desc, asc, sql } from "drizzle-orm";

export interface PostFilters {
  search?: string;
  published?: boolean | "all";
  tagId?: number;
  page?: number;
}

export interface PaginatedPosts {
  posts: Array<{
    id: number;
    slug: string;
    title: string;
    description: string;
    body: string;
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
  const {
    search,
    published: publishedFilter = "all",
    tagId,
    page = 1,
  } = filters;

  // Build where conditions
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

  if (publishedFilter !== "all") {
    conditions.push(eq(posts.published, publishedFilter));
  }

  // Handle tag filtering
  if (tagId) {
    // Query with tag join
    const offset = (page - 1) * POSTS_PER_PAGE;

    const postsQuery = db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        description: posts.description,
        body: posts.body,
        publishDate: posts.publishDate,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .innerJoin(postsTags, eq(posts.id, postsTags.postId))
      .where(
        and(
          eq(postsTags.tagId, tagId),
          conditions.length > 0 ? and(...conditions) : undefined
        )
      )
      .orderBy(desc(posts.publishDate))
      .limit(POSTS_PER_PAGE)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .innerJoin(postsTags, eq(posts.id, postsTags.postId))
      .where(
        and(
          eq(postsTags.tagId, tagId),
          conditions.length > 0 ? and(...conditions) : undefined
        )
      );

    const [postsResult, countResult] = await Promise.all([
      postsQuery,
      countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);

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

  // Query without tag join
  const offset = (page - 1) * POSTS_PER_PAGE;
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const postsQuery = db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      body: posts.body,
      publishDate: posts.publishDate,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.publishDate))
    .limit(POSTS_PER_PAGE)
    .offset(offset);

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(whereClause);

  const [postsResult, countResult] = await Promise.all([
    postsQuery,
    countQuery,
  ]);

  const total = Number(countResult[0]?.count ?? 0);

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
    .select({
      id: tags.id,
      value: tags.value,
    })
    .from(tags)
    .orderBy(asc(tags.value));
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

export async function getRecentJournalEntries(userId: number, limit: number = 3) {
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
