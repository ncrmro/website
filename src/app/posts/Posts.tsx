import { db, posts } from "@/database";
import { eq, desc, asc } from "drizzle-orm";
import React from "react";
import { PostItem } from "./PostItem";

export async function Posts() {
  const postsList = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      body: posts.body,
      publishDate: posts.publishDate,
      published: posts.published,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(asc(posts.published), desc(posts.publishDate));

  return (
    <ul role="list" className="-mb-8 md:max-w-3xl">
      {postsList.map((post, index: number) => (
        <PostItem
          key={post.slug}
          post={post}
          evenRow={index !== postsList.length - 1}
        />
      ))}
    </ul>
  );
}
