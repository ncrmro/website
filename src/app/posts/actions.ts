import { serialize } from "next-mdx-remote/serialize";

export async function serializePost(body: string) {
  return await serialize(body, {
    mdxOptions: { development: process.env.NODE_ENV === "development" },
  });
}
