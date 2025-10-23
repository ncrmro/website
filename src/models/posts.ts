import { db } from "@/lib/database";
import { DB } from "kysely-codegen";

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
    published: number;
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

  // Base query
  let query = db
    .selectFrom("posts")
    .select([
      "posts.id",
      "posts.slug",
      "posts.title",
      "posts.description",
      "posts.body",
      "posts.publish_date",
      "posts.published",
      "posts.created_at",
      "posts.updated_at",
    ]);

  // Apply filters
  if (search) {
    query = query.where((eb) =>
      eb.or([
        eb("posts.title", "like", `%${search}%`),
        eb("posts.description", "like", `%${search}%`),
        eb("posts.body", "like", `%${search}%`),
      ])
    );
  }

  if (published !== "all") {
    query = query.where("posts.published", "=", published ? 1 : 0);
  }

  if (tagId) {
    query = query
      .innerJoin("posts_tags", "posts.id", "posts_tags.post_id")
      .where("posts_tags.tag_id", "=", tagId);
  }

  // Get total count
  const countQuery = query.select((eb) =>
    eb.fn.countAll<number>().as("count")
  );
  const countResult = await countQuery.executeTakeFirst();
  const total = countResult?.count ?? 0;

  // Apply pagination
  const offset = (page - 1) * POSTS_PER_PAGE;
  const posts = await query
    .orderBy("posts.publish_date", "desc")
    .limit(POSTS_PER_PAGE)
    .offset(offset)
    .execute();

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
    .selectFrom("tags")
    .select(["id", "value"])
    .orderBy("value", "asc")
    .execute();
}

export async function getRecentPosts(limit: number = 3) {
  return await db
    .selectFrom("posts")
    .select([
      "id",
      "slug",
      "title",
      "description",
      "publish_date",
      "published",
      "updated_at",
    ])
    .orderBy("updated_at", "desc")
    .limit(limit)
    .execute();
}

export async function getRecentJournalEntries(userId: string, limit: number = 3) {
  return await db
    .selectFrom("journal_entries")
    .select(["id", "body", "created_date"])
    .where("user_id", "=", userId)
    .orderBy("created_date", "desc")
    .limit(limit)
    .execute();
}
