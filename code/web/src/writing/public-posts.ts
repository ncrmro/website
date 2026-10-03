import { collectionApp } from "./pages";
import type { RouteCache } from "@quiescent/astro";
export async function writingPosts(origin: string, cache: RouteCache) {
  const {service, pages} = collectionApp(origin, "posts", cache);
  const result = await service.listPublishedWithStatus();
  const posts = result.documents;
  pages.set(cache, undefined, result.cache);
  return posts.map(({document}) => ({id: document.id, slug: document.frontmatter.slug, data: {
    title: document.frontmatter.title, description: document.frontmatter.description,
    publish_date: new Date(document.frontmatter.publish_date ?? document.publishedAt ?? document.createdAt), tags: document.frontmatter.tags, published: true, draft: false,
  }}));
}
