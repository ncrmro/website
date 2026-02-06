import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { auth } from "@/app/auth";
import { getGravatarUrl, Viewer } from "@/lib/auth";
import { db, posts, tags, postsTags } from "@/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const [postResult] = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      slug: posts.slug,
      publishDate: posts.publishDate,
    })
    .from(posts)
    .where(eq(posts.slug, slug));

  if (!postResult) {
    return {
      title: "Post Not Found",
    };
  }

  const title = postResult.title || "Untitled Post";
  const description = postResult.description || "A blog post by Nicholas Romero";
  const url = `https://ncrmro.com/posts/${slug}`;
  const publishedTime = postResult.publishDate 
    ? new Date(postResult.publishDate).toISOString() 
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime,
      authors: ["Nicholas Romero"],
      images: [
        {
          url: "https://ncrmro.com/android-chrome-512x512.png",
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["https://ncrmro.com/android-chrome-512x512.png"],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  // Map NextAuth session to Viewer type if logged in
  let viewer: Viewer | undefined;
  if (session?.user) {
    viewer = {
      id: session.user.id,
      email: session.user.email!,
      image: session.user.image || getGravatarUrl(session.user.email!),
      firstName: session.user.name?.split(" ")[0] || null,
      lastName: session.user.name?.split(" ").slice(1).join(" ") || null,
    };
  }

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
  const mdxSource = await serializePost(p.body || "");

  return (
    <div className="w-full md:max-w-4xl">
      <Post viewer={viewer} post={p} source={mdxSource} />
    </div>
  );
}
