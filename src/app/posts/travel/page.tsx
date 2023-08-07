import { PostItem } from "@/app/posts/page";
import { db } from "@/lib/database";
import React, { PropsWithChildren } from "react";

export default async function TravelPosts() {
  const posts = await db
    .selectFrom("posts")
    .select(["slug", "title", "description", "body", "publish_date"])
    .innerJoin("posts_tags", "post_id", "posts.id")
    .innerJoin("tags", "tags.id", "posts_tags.tag_id")
    .orderBy("publish_date", "desc")
    .where("published", "=", 1)
    .where("tags.value", "=", "travel")
    .execute();
  return (
    <ul role="list" className="-mb-8">
      {posts.map((post, index) => (
        <PostItem post={post} evenRow={index !== posts.length - 1} />
      ))}
    </ul>
  );
}
