import { PostItem } from "@/app/posts/PostItem";
import { getPostsByTag } from "@/content/posts";
import React from "react";

export default async function FoodPostsPage() {
  const posts = await getPostsByTag("food");

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-4xl pt-6 text-gray-500 dark:text-gray-400">
        No food posts published yet.
      </div>
    );
  }

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
