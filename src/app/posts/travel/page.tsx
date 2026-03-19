import { getAllPosts } from "@/lib/posts";
import { PostItem } from "@/app/posts/PostItem";
import React from "react";

export default async function TravelPosts() {
  const postsList = getAllPosts().filter((p) => p.tags.includes("travel"));

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
