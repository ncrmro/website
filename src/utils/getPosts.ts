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
  if (!filePath.includes(".md")) {
    filePath = `${filePath}/post.md`;
  }
  const fileContent = await fs.promises.readFile(filePath, "utf8");
  const { data, value } = await unified()
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
    markdown: value,
  };
}

export default async function getPosts(postCategory?: PostCategory) {
  const categories = postCategory ? [postCategory] : Object.keys(PostCategory);
  const posts = new Map<string, Post>();

  const categoryYearFolders = await Promise.all(
    categories.map((category) =>
      (async () => [
        category,
        await fs.promises.readdir(`${postsDir}/${category}`),
      ])()
    )
  );
  const categoryYearFiles = await Promise.all(
    categoryYearFolders.map(([category, years]) =>
      Promise.all(
        (years as string[]).map((year) =>
          fs.promises
            .readdir(`${postsDir}/${category}/${year}`)
            .then((contents) => [year, contents])
        )
      ).then((yearFiles) => [category, yearFiles])
    )
  );
  await Promise.all(
    categoryYearFiles.reduce<Promise<void>[]>((acc, [category, years]) => {
      (years as Array<[string, string[]]>).forEach(([year, postFiles]) => {
        postFiles.forEach((post) =>
          acc.push(
            loadPost(`${postsDir}/${category}/${year}/${post}`).then((post) => {
              posts.set(post.slug, post);
            })
          )
        );
      });
      return acc;
    }, [])
  );

  return posts;
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
