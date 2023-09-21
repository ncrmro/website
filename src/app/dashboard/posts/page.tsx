import formatDate from "@/app/posts/formatDate";
import { useViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import React from "react";

function PostItem(props: {
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
        <div className="flex justify-between">
          <a
            href={`/dashboard/posts/${props.post.slug}`}
            className="font-medium text-gray-900"
          >
            {props.post.title}
          </a>
          {!props.post.published && (
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              Draft
            </span>
          )}
        </div>
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

export default async function PostsPage() {
  const posts = await db
    .selectFrom("posts")
    .select([
      "slug",
      "title",
      "description",
      "body",
      "publish_date",
      "published",
    ])
    .orderBy("publish_date", "desc")
    .execute();
  return (
    <>
      <ul role="list" className="-mb-8 md:max-w-3xl">
        {posts.map((post, index) => (
          <PostItem
            key={post.slug}
            post={post}
            evenRow={index !== posts.length - 1}
          />
        ))}
      </ul>
    </>
  );
}
