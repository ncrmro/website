import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { selectViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import { notFound } from "next/navigation";
import React from "react";
import { eq } from "drizzle-orm";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await selectViewer();
  
  const [postResult, tags] = await Promise.all([
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        description: schema.posts.description,
        body: schema.posts.body,
        slug: schema.posts.slug,
        published: schema.posts.published,
        publish_date: schema.posts.publish_date,
      })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1),
    db
      .select({
        id: schema.tags.id,
        value: schema.tags.value,
      })
      .from(schema.tags)
      .innerJoin(schema.posts_tags, eq(schema.posts_tags.tag_id, schema.tags.id))
      .innerJoin(schema.posts, eq(schema.posts.id, schema.posts_tags.post_id))
      .where(eq(schema.posts.slug, slug)),
  ]);
  
  const post = postResult[0];
  if (!post) notFound();
  
  // If viewer is not logged and and post is not published also not found
  if (post.published === false && !viewer) notFound();
  const p = { ...post, tags };
  const mdxSource = await serializePost(p.body);

  return (
    <div className="w-full md:max-w-4xl">
      <Post viewer={viewer} post={p} source={mdxSource} />
    </div>
  );
}
