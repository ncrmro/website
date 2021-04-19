import React, { PropsWithChildren } from "react";
import Link from "next/link";
import routes from "@router";
import { Post } from "@utils/markdown";

function PostCard(props) {
  return (
    <div className="flex-1 bg-white flex flex-col justify-between">
      <div className="flex-1">
        <Link {...routes.posts.post({ slug: props.slug })}>
          <a href="#" className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">{props.title}</p>
            <p className="mt-3 text-base text-gray-500">{props.description}</p>
          </a>
        </Link>
      </div>
      {/*<div className="mt-6 flex items-center">*/}
      {/*  <div className="ml-3">*/}
      {/*    <div className="flex space-x-1 text-sm text-gray-500">*/}
      {/*      <time dateTime="2020-03-16">Mar 16, 2020</time>*/}
      {/*      <span aria-hidden="true">&middot;</span>*/}
      {/*      <span>6 min read</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}

export default function Posts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <div className="grid w-full gap-12">
      {props.posts.length > 0 ? (
        props.posts.map((post) => <PostCard key={post.slug} {...post} />)
      ) : (
        <div>No posts :(</div>
      )}
    </div>
  );
}
