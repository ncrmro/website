import { selectViewer } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  const viewer = await selectViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all posts with their tags
    const posts = await db
      .selectFrom("posts")
      .leftJoin("posts_tags", "posts.id", "posts_tags.post_id")
      .leftJoin("tags", "posts_tags.tag_id", "tags.id")
      .select([
        "posts.id",
        "posts.title",
        "posts.description",
        "posts.body",
        "posts.slug",
        "posts.published",
        "posts.publish_date",
        "posts.created_at",
        "posts.updated_at",
        sql<string>`GROUP_CONCAT(tags.value)`.as("tags")
      ])
      .where("posts.user_id", "=", viewer.id)
      .groupBy("posts.id")
      .execute();

    // Format posts for sync
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      body: post.body,
      slug: post.slug,
      published: Boolean(post.published),
      publish_date: post.publish_date,
      created_at: post.created_at,
      updated_at: post.updated_at,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : []
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
  const viewer = await selectViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { posts } = await req.json();

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { error: "Posts must be an array" },
        { status: 400 }
      );
    }

    const results = [];

    for (const postData of posts) {
      const { title, description, body, slug, published, publish_date, tags } = postData;

      // Validate required fields
      if (!title || !body) {
        results.push({
          status: "error",
          message: "Title and body are required",
          data: postData
        });
        continue;
      }

      try {
        // Check if post exists by slug
        const existingPost = await db
          .selectFrom("posts")
          .select("id")
          .where("slug", "=", slug)
          .where("user_id", "=", viewer.id)
          .executeTakeFirst();

        let postId: string;

        if (existingPost) {
          // Update existing post
          await db
            .updateTable("posts")
            .set({
              title,
              description: description || "",
              body,
              published: published ? 1 : 0,
              publish_date: publish_date || null,
              updated_at: new Date().toISOString()
            })
            .where("id", "=", existingPost.id)
            .where("user_id", "=", viewer.id)
            .execute();

          postId = existingPost.id;
        } else {
          // Create new post
          const newPost = await db
            .insertInto("posts")
            .values({
              title,
              description: description || "",
              body,
              slug,
              user_id: viewer.id,
              published: published ? 1 : 0,
              publish_date: publish_date || null
            })
            .returning("id")
            .executeTakeFirstOrThrow();

          postId = newPost.id;
        }

        // Handle tags
        if (tags && Array.isArray(tags)) {
          // Remove existing tags
          await db
            .deleteFrom("posts_tags")
            .where("post_id", "=", postId)
            .execute();

          // Add new tags
          for (const tagValue of tags) {
            // Create tag if it doesn't exist
            await db
              .insertInto("tags")
              .values({ value: tagValue })
              .onConflict((oc) => oc.column("value").doNothing())
              .execute();

            // Get tag id
            const tag = await db
              .selectFrom("tags")
              .select("id")
              .where("value", "=", tagValue)
              .executeTakeFirstOrThrow();

            // Link post to tag
            await db
              .insertInto("posts_tags")
              .values({
                post_id: postId,
                tag_id: tag.id
              })
              .onConflict((oc) => oc.columns(["post_id", "tag_id"]).doNothing())
              .execute();
          }
        }

        results.push({
          status: "success",
          message: existingPost ? "Updated" : "Created",
          postId,
          slug
        });

      } catch (error) {
        results.push({
          status: "error",
          message: (error as Error).message,
          data: postData
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