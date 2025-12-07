import { PostItem } from "@/app/posts/PostItem";
import { db, posts, postsTags, tags } from "@/database";
import { eq, desc, and } from "drizzle-orm";
import React from "react";

export default async function TravelPosts() {
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
    .innerJoin(postsTags, eq(postsTags.postId, posts.id))
    .innerJoin(tags, eq(tags.id, postsTags.tagId))
    .where(and(eq(posts.published, true), eq(tags.value, "travel")))
    .orderBy(desc(posts.publishDate));

  return (
    <ul role="list" className="-mb-8">
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
