/* eslint-disable @next/next/no-img-element */
import formatDate from "@/app/posts/formatDate";
import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { PostType } from "../types";

function PostHeader(props: { post: PostType }) {
  return (
    <div className="pt-6 pb-5">
      <div className="sm:flex sm:items-baseline sm:justify-between">
        <div className="sm:w-0 sm:flex-1">
          <h1
            id="message-heading"
            className="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            {props.post.title}
          </h1>
          <div className="text-gray-500 dark:text-gray-400">
            {props.post.publishDate && formatDate(props.post.publishDate)}
          </div>
          <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
            {props.post.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Post(props: { post: PostType }) {
  return (
    <>
      <PostHeader post={props.post} />
      <div id="post-body" className="pt-6 pb-3 text-gray-500 dark:text-gray-400">
        <MDXRemote
          source={props.post.content}
          components={{
            ul: (p: any) => <ul className="list-disc px-4 py-2" {...p} />,
            pre: (p: any) => (
              <pre className="my-4 overflow-x-auto rounded bg-gray-100 dark:bg-gray-800 p-4 text-sm">
                {p.children}
              </pre>
            ),
            code: (p: any) => {
              const isCodeBlock =
                p.className && p.className.startsWith("language-");
              if (isCodeBlock) {
                return (
                  <code
                    className="font-mono text-gray-800 dark:text-gray-200"
                    {...p}
                  />
                );
              }
              return (
                <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
                  {p.children}
                </code>
              );
            },
            h2: (p: any) => (
              <h2
                className="text-base font-semibold leading-6 text-gray-900 dark:text-white py-3"
                {...p}
              />
            ),
            h3: (p: any) => (
              <h3
                className="text-base font-semibold leading-6 text-gray-900 dark:text-white py-2"
                {...p}
              />
            ),
            p: (p: any) => <p className="py-1" {...p} />,
            Image: (p: any) => (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  alt={p.alt}
                  style={{ maxWidth: "100%", height: "auto" }}
                  src={`/posts/${props.post.dirName}/media/${p.src}`}
                />
              </div>
            ),
            a: (p: any) => <a className="text-blue-700" {...p} />,
          }}
        />
      </div>
    </>
  );
}
