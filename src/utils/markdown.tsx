import React from "react";
import unified from "unified";
import parse from "remark-parse";
import remark2react from "remark-react";
import fm, { FrontMatterResult } from "front-matter";

interface PostAttributes {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: Array<string>;
}

export const getMetadata = (
  markdown: string
): FrontMatterResult<PostAttributes> => fm(markdown);

export const getContent = (markdown: string) =>
  unified()
    .use(parse)
    .use(remark2react, {
      sanitize: { attributes: { "*": ["className"] } },
      remarkReactComponents: {
        pre: (props) => (
          <pre className="whitespace-pre-wrap break-words	overflow-x-auto">
            {props.children}
          </pre>
        ),
        code: (props) => (
          <code className="overflow-x-auto">{props.children}</code>
        ),
      },
    })
    .processSync(markdown).result;

export interface Post extends PostAttributes {
  body: string;
}

export const getPosts = (fs): Array<Post> => {
  const postsDir = process.env.POSTS_DIR;
  const paths = [];
  fs.readdirSync(postsDir).forEach((file) => {
    file = `${postsDir}/${file}`;
    if (file.includes(".md")) {
      const content = fs.readFileSync(file, "utf8");
      const { body, attributes } = getMetadata(content);

      paths.push({ ...attributes, body });
    }
  });
  return paths;
};
