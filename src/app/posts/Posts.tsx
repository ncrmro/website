import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import React from "react";
import { PostItem } from "./PostItem";
import { eq, desc } from "drizzle-orm";

export async function Posts() {
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
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.publish_date));

  return (
    <ul role="list" className="-mb-8 md:max-w-3xl">
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