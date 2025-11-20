import { selectViewer } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/database";
import * as schema from "@/lib/schema";
import { createHash } from "crypto";
import { eq, and } from "drizzle-orm";

async function authenticateRequest(req: NextRequest) {
  // Check for Bearer token authentication
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const expectedToken = process.env.SYNC_AUTH_TOKEN;
    
    if (expectedToken && token === expectedToken) {
      // For token auth, we'll use a specific user (you may want to configure this)
      // For now, let's get the first user as the viewer
      const users = await db
        .select({
          id: schema.users.id,
          email: schema.users.email,
          first_name: schema.users.first_name,
          last_name: schema.users.last_name,
          image: schema.users.image,
        })
        .from(schema.users)
        .limit(1);
      
      const user = users[0];
      if (user) {
        // Add gravatar if no image
        if (!user.image) {
          const hash = createHash("md5");
          hash.update(user.email);
          const md5 = hash.digest("hex");
          user.image = `https://www.gravatar.com/avatar/${md5}`;
        }
        return user;
      }
    }
  }
  
  // Fall back to session-based authentication
  return await selectViewer();
}

export async function GET(req: NextRequest) {
  const viewer = await authenticateRequest(req);
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all posts with their tags
    const posts = await db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        description: schema.posts.description,
        body: schema.posts.body,
        slug: schema.posts.slug,
        published: schema.posts.published,
        publish_date: schema.posts.publish_date,
        created_at: schema.posts.created_at,
        updated_at: schema.posts.updated_at,
        tags: sql<string>`GROUP_CONCAT(${schema.tags.value})`,
      })
      .from(schema.posts)
      .leftJoin(schema.posts_tags, eq(schema.posts.id, schema.posts_tags.post_id))
      .leftJoin(schema.tags, eq(schema.posts_tags.tag_id, schema.tags.id))
      .where(eq(schema.posts.user_id, viewer.id))
      .groupBy(schema.posts.id);

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
  const viewer = await authenticateRequest(req);
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
        const existingPosts = await db
          .select({ id: schema.posts.id })
          .from(schema.posts)
          .where(and(
            eq(schema.posts.slug, slug),
            eq(schema.posts.user_id, viewer.id)
          ))
          .limit(1);

        const existingPost = existingPosts[0];
        let postId: string;

        if (existingPost) {
          // Update existing post
          await db
            .update(schema.posts)
            .set({
              title,
              description: description || "",
              body,
              published: published ? true : false,
              publish_date: publish_date || null,
              updated_at: new Date().toISOString()
            })
            .where(and(
              eq(schema.posts.id, existingPost.id),
              eq(schema.posts.user_id, viewer.id)
            ));

          postId = existingPost.id;
        } else {
          // Create new post
          const [newPost] = await db
            .insert(schema.posts)
            .values({
              title,
              description: description || "",
              body,
              slug,
              user_id: viewer.id,
              published: published ? true : false,
              publish_date: publish_date || null
            })
            .returning({ id: schema.posts.id });

          if (!newPost) {
            throw new Error("Failed to create post");
          }
          postId = newPost.id;
        }

        // Handle tags
        if (tags && Array.isArray(tags)) {
          // Remove existing tags
          await db
            .delete(schema.posts_tags)
            .where(eq(schema.posts_tags.post_id, postId));

          // Add new tags
          for (const tagValue of tags) {
            // Create tag if it doesn't exist (using INSERT OR IGNORE pattern)
            await db
              .insert(schema.tags)
              .values({ value: tagValue })
              .onConflictDoNothing();

            // Get tag id
            const tagResult = await db
              .select({ id: schema.tags.id })
              .from(schema.tags)
              .where(eq(schema.tags.value, tagValue))
              .limit(1);

            const tag = tagResult[0];
            if (!tag) {
              throw new Error(`Failed to get tag: ${tagValue}`);
            }

            // Link post to tag (using INSERT OR IGNORE pattern)
            await db
              .insert(schema.posts_tags)
              .values({
                post_id: postId,
                tag_id: tag.id
              })
              .onConflictDoNothing();
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