import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import fg from "fast-glob";
import matter from "gray-matter";
import { normalizeStringArray } from "./frontmatter";
import type { PostDoc } from "./types";

const POSTS_GLOB = "src/app/posts/*/page.mdx";

function assertString(value: unknown, fieldName: string, sourcePath: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid ${fieldName} in ${sourcePath}`);
  }

  return value.trim();
}

function assertBoolean(value: unknown, fieldName: string, sourcePath: string) {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${fieldName} in ${sourcePath}`);
  }

  return value;
}

async function readPost(sourcePath: string): Promise<PostDoc> {
  const raw = await fs.readFile(sourcePath, "utf8");
  const { data: frontmatter } = matter(raw);
  const dirname = path.basename(path.dirname(sourcePath));
  const slug = assertString(frontmatter.slug ?? dirname, "slug", sourcePath);

  return {
    docType: "post",
    slug,
    title: assertString(frontmatter.title, "title", sourcePath),
    description: assertString(frontmatter.description, "description", sourcePath),
    date: assertString(frontmatter.date, "date", sourcePath),
    published: assertBoolean(frontmatter.published, "published", sourcePath),
    tags: normalizeStringArray(frontmatter.tags),
    places: normalizeStringArray(frontmatter.places),
    ...(typeof frontmatter.featuredImage === "string"
      ? { featuredImage: frontmatter.featuredImage }
      : {}),
  };
}

export const getAllPosts = cache(async (): Promise<PostDoc[]> => {
  const cwd = process.cwd();
  const sources = await fg(POSTS_GLOB, { cwd, absolute: true });
  const posts = await Promise.all(sources.map(readPost));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.published);
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getAllPostSlugs() {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

export async function getPostsByTag(tag: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getPostsByAnyTag(tags: string[]) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => tags.some((tag) => post.tags.includes(tag)));
}
