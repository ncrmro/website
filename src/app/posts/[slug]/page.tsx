import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { selectViewer } from "@/lib/auth";
import { db, posts, tags, postsTags } from "@/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import React from "react";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await selectViewer();

  const [postResult, tagsResult] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        body: posts.body,
        slug: posts.slug,
        published: posts.published,
        publishDate: posts.publishDate,
      })
      .from(posts)
      .where(eq(posts.slug, slug)),
    db
      .selectDistinct({
        id: tags.id,
        value: tags.value,
      })
      .from(tags)
      .innerJoin(postsTags, eq(postsTags.tagId, tags.id))
      .innerJoin(posts, eq(posts.id, postsTags.postId))
      .where(eq(posts.slug, slug)),
  ]);

  const post = postResult[0];

  // If viewer is not logged and and post is not published also not found
  if (!post || (!post.published && !viewer)) notFound();

  const p = { ...post, tags: tagsResult };
  const mdxSource = await serializePost(p.body);

  return (
    <div className="w-full md:max-w-4xl">
      <Post viewer={viewer} post={p} source={mdxSource} />
    </div>
  );
}
