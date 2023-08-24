import formatDate from "@/app/posts/formatDate";
import { useViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import React from "react";

export function PostItem(props: {
  post: {
    slug: string;
    title: string;
    description: string;
    publish_date: string | null;
    published: number;
  };
  evenRow: boolean;
}) {
  return (
    <li key={props.post.slug} className="p-2">
      <div>
        <a
          href={`/posts/${props.post.slug}`}
          className="font-medium text-gray-900"
        >
          {!props.post.published && "Draft!"}
          {props.post.title}
        </a>
        <p className="mt-0.5 text-sm text-gray-500">
          {props.post.publish_date && formatDate(props.post.publish_date)}
        </p>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <p>{props.post.description}</p>
      </div>
    </li>
  );
}

export async function Posts() {
  const viewer = await useViewer();
  const postsQuery = db
    .selectFrom("posts")
    .select([
      "slug",
      "title",
      "description",
      "body",
      "publish_date",
      "published",
    ])
    .orderBy("publish_date", "desc");
  // Viewers can only see published posts
  if (!viewer) postsQuery.where("published", "=", 1);
  const posts = await postsQuery.execute();
  return (
    <ul role="list" className="-mb-8 md:max-w-3xl">
      {posts.map((post, index) => (
        <PostItem
          key={post.slug}
          post={post}
          evenRow={index !== posts.length - 1}
        />
      ))}
    </ul>
  );
}

export default async function PostsPage() {
  const posts = await Posts();
  return (
    <div>
      <h1>Posts</h1>
      {posts}
    </div>
  );
}
