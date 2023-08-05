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
      <div className="relative pb-8">
        {props.evenRow ? (
          <span
            className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
        ) : null}
        <div className="relative flex items-start space-x-3 pl-10">
          {props.post.description ? (
            <>
              <div className="">
                {/*<img*/}
                {/*  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"*/}
                {/*  src={props.post.imageUrl}*/}
                {/*  alt=""*/}
                {/*/>*/}

                <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                  {/*<ChatBubbleLeftEllipsisIcon*/}
                  {/*  className="h-5 w-5 text-gray-400"*/}
                  {/*  aria-hidden="true"*/}
                  {/*/>*/}
                </span>
              </div>
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
            </>
          ) : (
            <>
              <div>
                <div className="relative px-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                    {/*<UserCircleIcon*/}
                    {/*  className="h-5 w-5 text-gray-500"*/}
                    {/*  aria-hidden="true"*/}
                    {/*/>*/}
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 py-1.5">
                {/*<div className="text-sm text-gray-500">*/}
                {/*  <a*/}
                {/*    href={props.post.person.href}*/}
                {/*    className="font-medium text-gray-900"*/}
                {/*  >*/}
                {/*    {props.post.person.name}*/}
                {/*  </a>{" "}*/}
                {/*  assigned{" "}*/}
                {/*  <a*/}
                {/*    href={props.post.assigned.href}*/}
                {/*    className="font-medium text-gray-900"*/}
                {/*  >*/}
                {/*    {props.post.assigned.name}*/}
                {/*  </a>{" "}*/}
                {/*  <span className="whitespace-nowrap">{props.post.date}</span>*/}
                {/*</div>*/}
              </div>
            </>
          )}
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
