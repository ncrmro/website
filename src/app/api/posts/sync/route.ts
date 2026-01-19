import { auth } from "@/app/auth";
import { getGravatarUrl } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db, users, posts, tags, postsTags, getResultArray } from "@/database";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

async function authenticateRequest(req: NextRequest) {
  // Check for Bearer token authentication
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const expectedToken = process.env.SYNC_AUTH_TOKEN;

    if (expectedToken && token === expectedToken) {
      // For token auth, we'll use a specific user (you may want to configure this)
      // For now, let's get the first user as the viewer
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          image: users.image,
        })
        .from(users)
        .limit(1);

      const user = result[0];
      if (user) {
        // Add gravatar if no image
        const image = user.image || getGravatarUrl(user.email);
        return { ...user, image };
      }
    }
  }

  // Fall back to session-based authentication via NextAuth
  const session = await auth();
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email!,
      image: session.user.image || getGravatarUrl(session.user.email!),
      firstName: session.user.name?.split(" ")[0] || null,
      lastName: session.user.name?.split(" ").slice(1).join(" ") || null,
    };
  }

  return null;
}

export async function GET(req: NextRequest) {
  const viewer = await authenticateRequest(req);
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all posts with their tags using GROUP_CONCAT
    const postsResult = await db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        body: posts.body,
        slug: posts.slug,
        published: posts.published,
        publishDate: posts.publishDate,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        tags: sql<string>`GROUP_CONCAT(${tags.value})`.as("tags"),
      })
      .from(posts)
      .leftJoin(postsTags, eq(posts.id, postsTags.postId))
      .leftJoin(tags, eq(postsTags.tagId, tags.id))
      .where(eq(posts.userId, viewer.id))
      .groupBy(posts.id);

    // Format posts for sync
    const formattedPosts = postsResult.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      body: post.body,
      slug: post.slug,
      published: post.published,
      publish_date: post.publishDate,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      tags: post.tags ? post.tags.split(",").filter(Boolean) : [],
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching posts for sync:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const viewer = await authenticateRequest(req);
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { posts: postsData } = (await req.json()) as { posts: unknown };

    if (!Array.isArray(postsData)) {
      return NextResponse.json(
        { error: "Posts must be an array" },
        { status: 400 }
      );
    }

    const results = [];

    for (const postData of postsData) {
      const {
        title,
        description,
        body,
        slug,
        published,
        publish_date,
        tags: tagValues,
      } = postData;

      // Validate required fields
      if (!title || !body) {
        results.push({
          status: "error",
          message: "Title and body are required",
          data: postData,
        });
        continue;
      }

      try {
        // Check if post exists by slug
        const existingPostResult = await db
          .select({ id: posts.id })
          .from(posts)
          .where(and(eq(posts.slug, slug), eq(posts.userId, viewer.id)));

        const existingPost = existingPostResult[0];
        let postId: string;

        if (existingPost) {
          // Update existing post
          await db
            .update(posts)
            .set({
              title,
              description: description || "",
              body,
              published: Boolean(published),
              publishDate: publish_date || null,
              updatedAt: new Date().toISOString(),
            })
            .where(and(eq(posts.id, existingPost.id), eq(posts.userId, viewer.id)));

          postId = existingPost.id;
        } else {
          // Create new post
          const newPostResult = await db
            .insert(posts)
            .values({
              id: randomUUID(),
              title,
              description: description || "",
              body,
              slug,
              userId: viewer.id,
              published: Boolean(published),
              publishDate: publish_date || null,
            })
            .returning({ id: posts.id });

          const newPostRows = getResultArray(newPostResult);
          const newPost = newPostRows[0];
          if (!newPost) throw new Error("Failed to create post");
          postId = newPost.id;
        }

        // Handle tags
        if (tagValues && Array.isArray(tagValues)) {
          // Remove existing tags
          await db.delete(postsTags).where(eq(postsTags.postId, postId));

          // Add new tags
          for (const tagValue of tagValues) {
            // Create tag if it doesn't exist (using INSERT OR IGNORE pattern)
            await db
              .insert(tags)
              .values({ id: randomUUID(), value: tagValue })
              .onConflictDoNothing();

            // Get tag id
            const tagResult = await db
              .select({ id: tags.id })
              .from(tags)
              .where(eq(tags.value, tagValue));

            const tag = tagResult[0];
            if (tag) {
              // Link post to tag (using INSERT OR IGNORE pattern)
              await db
                .insert(postsTags)
                .values({
                  id: randomUUID(),
                  postId: postId,
                  tagId: tag.id,
                })
                .onConflictDoNothing();
            }
          }
        }

        results.push({
          status: "success",
          message: existingPost ? "Updated" : "Created",
          postId,
          slug,
        });
      } catch (error) {
        results.push({
          status: "error",
          message: (error as Error).message,
          data: postData,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error syncing posts:", error);
    return NextResponse.json(
      { error: "Failed to sync posts" },
      { status: 500 }
    );
  }
}
