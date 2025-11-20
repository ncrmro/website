import { PostItem } from "@/app/posts/PostItem";
import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import React, { PropsWithChildren } from "react";
import { eq, and, desc } from "drizzle-orm";

export default async function TravelPosts() {
  const posts = await db
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      description: schema.posts.description,
      body: schema.posts.body,
      publish_date: schema.posts.publish_date,
      published: schema.posts.published,
    })
    .from(schema.posts)
    .innerJoin(schema.posts_tags, eq(schema.posts_tags.post_id, schema.posts.id))
    .innerJoin(schema.tags, eq(schema.tags.id, schema.posts_tags.tag_id))
    .where(and(
      eq(schema.posts.published, true),
      eq(schema.tags.value, "travel")
    ))
    .orderBy(desc(schema.posts.publish_date));
    
  return (
    <ul role="list" className="-mb-8">
      {posts.map((post: any, index: number) => (
        <PostItem
          key={post.slug}
          post={post}
          evenRow={index !== posts.length - 1}
        />
      ))}
    </ul>
  );
}
