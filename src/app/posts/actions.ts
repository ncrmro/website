import { PostType } from "@/app/posts/types";
import { serialize } from "next-mdx-remote/serialize";

export async function serializePost(post: PostType) {
  return await serialize(post.body, {
    mdxOptions: { development: process.env.NODE_ENV === "development" },
  });
}
