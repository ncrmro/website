import fs from "fs";
import React from "react";
import fm, { FrontMatterResult } from "front-matter";

export interface PostAttributes {
  slug: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  description: string;
  tags: Array<string>;
}

export const getMetadata = (
  markdown: string
): FrontMatterResult<PostAttributes> => fm(markdown);

export interface Post extends PostAttributes {
  content: string;
}

export const getPosts = (tags?: string[]): Array<Post> => {
  const fs = require("fs");
  const postsDir = process.env.POSTS_DIR;
  let posts = [];
  fs.readdirSync(postsDir).forEach((file) => {
    file = `${postsDir}/${file}`;
    if (file.includes(".md")) {
      const content = fs.readFileSync(file, "utf8");
      const { body, attributes } = getMetadata(content);
      posts.push({ ...attributes, date: Date.parse(attributes.date), body });
    }
  });
  posts.sort((a, b) => b.date - a.date);
  if (tags) {
    let tag;
    posts = posts.filter((post) => {
      for (tag of tags) {
        if (post.tags.includes(tag)) {
          return true;
        }
      }
    });
  }
  return posts;
};
