import { getPostsByTag } from "@/lib/posts";
import { PostItem } from "@/app/posts/PostItem";
import React from "react";

function TechnologyPosts() {
  const postsList = getPostsByTag("food");

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

export default TechnologyPosts;
