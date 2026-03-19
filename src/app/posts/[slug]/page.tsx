import Post from "@/app/posts/[slug]/Post";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.title;
  const description = post.description || "A blog post by Nicholas Romero";
  const url = `https://ncrmro.com/posts/${slug}`;
  const publishedTime = post.publishDate
    ? new Date(post.publishDate).toISOString()
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
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="w-full md:max-w-4xl">
      <Post post={post} />
    </div>
  );
}
