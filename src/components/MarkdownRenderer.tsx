import { Post } from "@utils/getPosts";
import React from "react";
import remarkFrontmatter from "remark-frontmatter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import slug from "rehype-slug";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeReact from "rehype-react";
import { visit } from "unist-util-visit";

const processor = (mediaPath: Post["mediaPath"]) =>
  unified()
    .use(remarkParse)
    .use(slug)
    .use(remarkToc)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(remarkFrontmatter, ["yaml"])
    .use(
      () => (tree) =>
        visit(tree, "element", (node) => {
          // @ts-ignore
          if (node.tagName === "img") {
            // @ts-ignore
            node.properties.src = `${mediaPath}/${node.properties.src}`;
          }
        })
    )
    .use(rehypeReact, { createElement: React.createElement });

const MarkdownRenderer: React.FC<Post> = (props) => {
  const content = processor(props.mediaPath).processSync(props.markdown);
  return (
    <>
      <div>{content.result}</div>
    </>
  );
};

export default MarkdownRenderer;
