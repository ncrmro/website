import Post from "@/app/posts/[slug]/Post";
import { db } from "@/lib/database";
import { serialize } from "next-mdx-remote/serialize";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await db
    .selectFrom("posts")
    .select(["title", "body", "slug", "publish_date"])
    .where("slug", "=", params.slug)
    .executeTakeFirst();
  if (!post) {
    notFound();
  }
  const mdxSource = await serialize(post.body);

  return (
    <div>
      <h1>{post.title}</h1>
      <Post post={post} source={mdxSource} />
      <Link href={`/posts/${post.slug}/edit`}>Edit</Link>
    </div>
  );
}
