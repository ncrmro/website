import type { PostDoc } from "@/content/types";
import React from "react";
import { PostItem } from "./PostItem";

export function Posts(props: { posts: PostDoc[] }) {
  return (
    <ul role="list" className="-mb-8 md:max-w-3xl">
      {props.posts.map((post, index: number) => (
        <PostItem
          key={post.slug}
          post={post}
          evenRow={index !== props.posts.length - 1}
        />
      ))}
    </ul>
  );
}
