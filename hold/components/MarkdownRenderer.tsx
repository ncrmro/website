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
import dockerfile from "highlight.js/lib/languages/dockerfile";
import styles from "./MarkdownRenderer.module.css";
import {Document} from "@quiescent/server"

const processor = (mediaPath: string) =>
  unified()
    .use(remarkParse)
    .use(slug)
    .use(remarkToc)
    .use(remarkRehype)
    .use(rehypeHighlight, {
      plainText: ["json5", "yamlex"],
      languages: {
        dockerfile: dockerfile,
      },
    })
    .use(remarkFrontmatter, ["yaml"])
    .use(
      () => (tree) =>
        visit(tree, "element", (node) => {
          // @ts-ignore
          if (node.tagName === "img") {
            // @ts-ignore
            node.properties.src = `${mediaPath}/${node.properties.src}`;
            // @ts-ignore
            node.properties.className = styles.img;
          }
        })
    )
    .use(rehypeReact, { createElement: React.createElement });

const MarkdownRenderer: React.FC<Document> = (props) => {
  const content = processor("").processSync(props.content);
  return content.result;
};

export default MarkdownRenderer;
