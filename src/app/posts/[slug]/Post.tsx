"use client";
import { default as NextImage } from "next/image";
import React from "react";
import { MDXRemote } from "next-mdx-remote";
import Highlight from "react-highlight";
import "./code-block.css";
interface Post {
  title: string;
  body: string;
  slug: string;
  publish_date: string | null;
}

export default function Post(props: { source: any; post: Post }) {
  return (
    <div id="post-body">
      <MDXRemote
        {...props.source}
        components={{
          code: (p: any) => (
            <Highlight className={p.className}>{p.children}</Highlight>
          ),
          Image: (p: any) => {
            if (!props.post.publish_date) throw new Error("");
            return (
              <div style={{ display: "flex", justifyContent: "center" }}>
                {/*// @ts-ignore/*/}
                <NextImage
                  {...props}
                  width={500}
                  height={500}
                  src={`/posts/${props.post.publish_date.replaceAll(
                    "-",
                    "_"
                  )}_${props.post.slug}/media/${p.src}`}
                />
              </div>
            );
          },
        }}
      />
    </div>
  );
}
