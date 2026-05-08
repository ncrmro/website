import { PostItem } from "@/app/posts/PostItem";
import { getPostsByTag } from "@/content/posts";
import React from "react";

export default async function TravelPosts() {
  const posts = await getPostsByTag("travel");

  return (
    <ul role="list" className="-mb-8">
      {posts.map((post, index: number) => (
        <PostItem
          key={post.slug}
          post={post}
          evenRow={index !== posts.length - 1}
        />
      ))}
    </ul>
  );
}
