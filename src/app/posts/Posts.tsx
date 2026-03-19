import { getAllPosts } from "@/lib/posts";
import React from "react";
import { PostItem } from "./PostItem";

export async function Posts() {
  const postsList = getAllPosts();

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
