import React from "react";
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
      paths.push({ ...attributes, date: Date.parse(attributes.date), body });
    }
  });
  return paths.sort((a, b) => b.date - a.date);
};
