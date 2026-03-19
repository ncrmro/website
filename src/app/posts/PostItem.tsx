import formatDate from "@/app/posts/formatDate";
import React from "react";

export function PostItem(props: {
  post: {
    slug: string;
    title: string;
    description: string;
    publishDate: string | null;
  };
  evenRow: boolean;
}) {
  return (
    <li key={props.post.slug} className="p-2">
      <div>
        <div className="flex justify-between">
          <a
            href={`/posts/${props.post.slug}`}
            className="font-medium text-gray-900 dark:text-white"
          >
            {props.post.title}
          </a>
        </div>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {props.post.publishDate && formatDate(props.post.publishDate)}
        </p>
      </div>
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
        <p>{props.post.description}</p>
      </div>
    </li>
  );
} 