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
  // Kysely has a better function to aggregate sub query but sqlite version wasn't exported?
  // https://github.com/kysely-org/kysely/issues/628
  const [post, tags] = await Promise.all([
    db
      .selectFrom("posts")
      .select([
        "id",
        "title",
        "description",
        "body",
        "slug",
        "published",
        "publish_date",
      ])
      .where("slug", "=", params.slug)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("tags")
      .select(["tags.id", "tags.value"])
      .innerJoin("posts_tags", "posts_tags.tag_id", "tags.id")
      .innerJoin("posts", "posts.id", "posts_tags.post_id")
      .where("posts.slug", "=", params.slug)
      .distinct()
      .execute(),
  ]);
  // If viewer is not logged and and post is not published also not found
  if (!post || (post.published === 0 && !viewer)) notFound();
  const p = { ...post, tags };
  const mdxSource = await serializePost(p);

  return (
    <div className="w-full md:max-w-4xl">
      <Post viewer={viewer} post={p} source={mdxSource} />
    </div>
  );
}
