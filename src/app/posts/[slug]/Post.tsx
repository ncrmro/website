"use client";
import { default as NextImage } from "next/image";
import React, { ReactElement } from "react";
import { MDXRemote } from "next-mdx-remote";

interface Post {
  title: string;
  body: string;
  slug: string;
  publish_date: string;
}

export default function Post(props: { source: any; post: Post }) {
  return (
    <div id="post-body">
      <MDXRemote
        {...props.source}
        components={{
          Image: (p: any) => (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {/*// @ts-ignore/*/}
              <NextImage
                {...props}
                width={500}
                height={500}
                src={`/posts/${props.post.publish_date.replaceAll("-", "_")}_${
                  props.post.slug
                }/media/${p.src}`}
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
