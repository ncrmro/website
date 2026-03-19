import { getPostsByTag } from "@/lib/posts";
import { PostItem } from "@/app/posts/PostItem";
import React from "react";

export default function TechnologyPostsPage() {
  // Include both "tech" and "technical" tags for backward compatibility
  const seen = new Set<string>();
  const postsList = [
    ...getPostsByTag("tech"),
    ...getPostsByTag("technical"),
  ].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

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
