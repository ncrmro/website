import React from "react";
import { getPublishedPosts } from "@/content/posts";
import { Posts } from "./Posts";

export default async function PostsPage() {
  const posts = await getPublishedPosts();
  return <Posts posts={posts} />;
}
