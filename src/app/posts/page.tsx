import { Posts } from "@/components/Posts";
import React from "react";

export default async function PostsPage() {
  const posts = await Posts();
  return <>{posts}</>;
}
