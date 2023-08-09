import Post from "@/app/posts/[slug]/Post";
import { useViewer } from "@/lib/auth";
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
  const viewer = await useViewer();
  const post = await db
    .selectFrom("posts")
    .select(["title", "body", "slug", "publish_date", "published"])
    .where("slug", "=", params.slug)
    .executeTakeFirst();
  // If viewer is not logged and and post is not published also not found
  if (!post || (post.published === 0 && !viewer)) notFound();
  const mdxSource = await serialize(post.body);

  return (
    <div>
      <h1>{post.title}</h1>
      <Post post={post} source={mdxSource} />
      <Link href={`/posts/${post.slug}/edit`}>Edit</Link>
    </div>
  );
}
