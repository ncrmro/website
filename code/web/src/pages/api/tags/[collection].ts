import type { APIRoute } from "astro";
import { collectionApp } from "../../../writing/pages";

/** Suggestions come only from published documents, never draft branches. */
export const GET: APIRoute = async (context) => {
  const collection = context.params.collection;
  if (collection !== "posts")
    return new Response("Not found", { status: 404 });
  const { service } = collectionApp(context.url.origin, collection, context.cache);
  const published = await service.listPublished();
  const tags = new Map<string, string>();
  for (const { document } of published) {
    for (const value of document.frontmatter.tags) {
      const tag = value.trim();
      if (tag) tags.set(tag.toLowerCase(), tag);
    }
  }
  context.cache.set(false);
  return Response.json(
    [...tags.values()].sort((a, b) => a.localeCompare(b)),
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
};
