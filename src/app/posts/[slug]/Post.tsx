"use client";
import React from "react";
import { MDXRemote } from "next-mdx-remote";

export default function Post(props: { source: any }) {
  return (
    <div id="post-body">
      <MDXRemote {...props.source} />
    </div>
  );
}
