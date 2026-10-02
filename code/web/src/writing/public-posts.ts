import { env } from "cloudflare:workers";
import { collectionApp } from "./pages";
import type { RouteCache } from "@quiescent/astro";
export async function writingPosts(origin: string, cache: RouteCache) {
  if (!env.SERVICE_TOKEN) return [];
  const {service, pages} = collectionApp(origin);
  const posts = await service.listPublished();
  pages.set(cache);
  return posts.map(({document}) => ({id: document.id, slug: document.frontmatter.slug, data: {
    title: document.frontmatter.title, description: document.frontmatter.description,
    publish_date: new Date(document.createdAt), published: true, draft: false,
  }}));
}
