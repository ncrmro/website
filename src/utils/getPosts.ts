import fs from "fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkFrontmatterExtract from "remark-extract-frontmatter";
import remarkStringify from "remark-stringify";
import yaml from "yaml";

const postsDir = `${process.cwd()}/public/posts`;

export enum PostCategory {
  technical = "technical",
  travel = "travel",
  // food = "food",
}

export interface Post {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  date: number;
  start?: number;
  end?: number;
  markdown: string;
  mediaPath?: string;
}

/**
 * Load the markdown content and parse the metadata
 * @param filePath
 */
async function loadPost(filePath: string) {
  let mediaPath: string;
  if (!filePath.includes(".md")) {
    mediaPath = `${filePath.split(postsDir)[1]}/media`;
    filePath = `${filePath}/post.md`;
  }
  const fileContent = await fs.promises.readFile(filePath);
  const { data, value: markdown } = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkFrontmatterExtract, { yaml: yaml.parse })
    .process(fileContent);

  return <Post>{
    ...data,
    date: Date.parse(
      (data.date as unknown as string) || (data.date as unknown as string)
    ),
    mediaPath,
    markdown,
  };
}

export default async function getPosts(postCategory?: PostCategory) {
  const categories = postCategory ? [postCategory] : Object.keys(PostCategory);
  const postsMap = new Map<string, Post>();

  await Promise.all(
    categories.map((category) =>
      (async () => {
        const years = await fs.promises.readdir(`${postsDir}/${category}`);
        await Promise.all(
          years.map((year) =>
            fs.promises
              .readdir(`${postsDir}/${category}/${year}`)
              .then((posts) =>
                Promise.all(
                  posts.map((post) =>
                    loadPost(`${postsDir}/${category}/${year}/${post}`).then(
                      (post) => postsMap.set(post.slug, post)
                    )
                  )
                )
              )
          )
        );
      })()
    )
  );

  return postsMap;
}

export async function postSlugs(postCategory?: PostCategory) {
  const postMap = await getPosts(postCategory);
  // @ts-ignore
  const slugs = [...postMap.keys()];
  slugs.sort((a, b) => b.date - a.date);
  return slugs;
}

export async function orderedPostsArray(postCategory?: PostCategory) {
  const postMap = await getPosts(postCategory);
  // @ts-ignore
  const posts = [...postMap.values()];
  posts.sort((a, b) => b.date - a.date);
  return posts;
}

export async function postBySlug(slug: Post["slug"]) {
  const postMap = await getPosts();
  return postMap.get(slug);
}
