import type { MDXComponents } from "mdx/types";
import PostImage from "@/app/posts/[slug]/PostImage";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: ({ src, alt }) => (
      <PostImage src={typeof src === "string" ? src : ""} alt={alt ?? ""} />
    ),
    PostImage,
  };
}
