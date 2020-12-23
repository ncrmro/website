import CodeBlock from "@components/CodeBlock";
import { Language } from "prism-react-renderer";
import React from "react";
import fm, { FrontMatterResult } from "front-matter";
import unified from "unified";
import parse from "remark-parse";
import remark2react from "remark-react";

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

export interface Post extends PostAttributes {
  content: string;
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

export const getContent = (markdown: string) =>
  unified()
    .use(parse)
    .use(remark2react, {
      sanitize: { attributes: { "*": ["className"] } },
      remarkReactComponents: {
        pre: (props) => {
          const className: string = props.children[0].props?.className;
          if (className.includes("language-")) {
            let language = className.replace("language-", "");
            const code = props.children[0].props.children[0];
            if (language === "typescript") {
              language = "jsx";
            }

            return <CodeBlock code={code} language={language as Language} />;
          }

          return <pre>{props.children}</pre>;
        },
        // code: (props) => (
        //   <code className="overflow-x-auto">{props.children}</code>
        // ),
      },
    })
    // .use(prism)
    .processSync(markdown).result;
