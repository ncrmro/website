import { PostItem } from "@/components/PostItem";
import { db } from "@/lib/database";
import React from "react";

export default async function PostsPage() {
  const posts = await db
    .selectFrom("posts")
    .select([
      "slug",
      "title",
      "description",
      "body",
      "publish_date",
      "published",
    ])
    .orderBy("publish_date", "desc")
    .execute();
  return (
    <main className="lg:pr-96">
      <ul role="list" className="-mb-8 md:max-w-3xl">
        {posts.map((post, index) => (
          <PostItem
            key={post.slug}
            post={post}
            evenRow={index !== posts.length - 1}
            dashboard
          />
        ))}
      </ul>
    </main>
  );
}
