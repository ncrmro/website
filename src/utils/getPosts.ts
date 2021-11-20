import { getMetadata, PostAttributes } from "@utils/markdown";
import fs from "fs";
const postsDir = `${process.cwd()}/public/posts`;

enum PostCategory {
  technical = "technical",
  travel = "travel",
  food = "food",
}

export interface Post {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  date: number;
  body: string;
  mediaPath?: string;
}

export default async function getPosts(postCategory?: PostCategory) {
  const posts: Record<string, Post> = {};
  for (const category of postCategory
    ? [postCategory]
    : Object.keys(PostCategory)) {
    const postCategory = `${postsDir}/${category}`;
    const yearFolders = fs.readdirSync(postCategory);
    for (const year of yearFolders) {
      const yearFolder = `${postCategory}/${year}`;
      for (const post of fs.readdirSync(yearFolder)) {
        let postPath = `${yearFolder}/${post}`;
        let mediaPath = null;
        if (!post.includes(".md")) {
          mediaPath = `${postPath.split("public")[1]}/media`;
          postPath = `${postPath}/post.md`;
        }

        const postContent = fs.readFileSync(postPath, "utf-8");

        const { body, attributes } = getMetadata(postContent);

        console.log(mediaPath);
        posts[attributes.slug] = {
          ...attributes,
          date: Date.parse(attributes.date ?? attributes.start),
          body,
          mediaPath,
        };
      }
    }
  }
  return posts;
}
