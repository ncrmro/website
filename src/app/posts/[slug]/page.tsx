import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { useViewer } from "@/lib/auth";
import { db } from "@/lib/database";
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
    .select([
      "id",
      "title",
      "description",
      "body",
      "slug",
      "publish_date",
      "published",
    ])
    .where("slug", "=", params.slug)
    .executeTakeFirst();
  // If viewer is not logged and and post is not published also not found
  if (!post || (post.published === 0 && !viewer)) notFound();
  const mdxSource = await serializePost(post);

  return (
    <div className="w-full md:max-w-4xl">
      <Post viewer={viewer} post={post} source={mdxSource} />
    </div>
  );
}
