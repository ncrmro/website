import formatDate from "@/app/posts/formatDate";
import type { PostDoc } from "@/content/types";
import Link from "next/link";
import React from "react";

export function PostItem(props: {
  post: Pick<PostDoc, "slug" | "title" | "description" | "date" | "published">;
  evenRow: boolean;
}) {
  return (
    <li key={props.post.slug} className="p-2">
      <div>
        <div className="flex justify-between">
          <Link
            href={`/posts/${props.post.slug}`}
            className="font-medium text-gray-900 dark:text-white"
          >
            {props.post.title}
          </Link>
          {!props.post.published && (
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              Draft
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {formatDate(props.post.date)}
        </p>
      </div>
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
        <p>{props.post.description}</p>
      </div>
    </li>
  );
}
