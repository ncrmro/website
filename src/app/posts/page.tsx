import { db } from "@/lib/database";
import React from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function PostItem(props: {
  post: {
    slug: string;
    title: string;
    description: string;
    publish_date?: string;
  };
  evenRow: boolean;
  index: string;
}) {
  return (
    <li key={props.post.slug} className="flex">
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <a
              href={`/posts/${props.post.slug}`}
              className="font-medium text-gray-900"
            >
              {props.post.title}
            </a>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {props.post.publish_date}
          </p>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <p>{props.post.description}</p>
        </div>
      </div>
    </li>
  );
}

export async function Posts() {
  const posts = await db
    .selectFrom("posts")
    .select(["slug", "title", "description", "body", "publish_date"])
    .orderBy("publish_date", "desc")
    .where("published", "=", 1)
    .execute();
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {posts.map((post, index) => (
          <PostItem post={post} evenRow={index !== posts.length - 1} />
        ))}
      </ul>
    </div>
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
