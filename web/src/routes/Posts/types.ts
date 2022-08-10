import { Document } from "@quiescent/server";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

export interface Post extends Document {
  description: string;
  state: "draft" | "published";
}

/**
 * Used during server side and static props
 */
export interface MDXPost extends Omit<Post, "content"> {
  content: MDXRemoteSerializeResult;
}
