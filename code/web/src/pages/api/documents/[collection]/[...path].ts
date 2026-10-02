import type { APIRoute } from "astro";
import { adminThumbnail } from "../../../../writing/admin-thumbnail";
import { collectionApp } from "../../../../writing/pages";
export const ALL: APIRoute = (context) => {
  const collection = context.params.collection;
  if (collection !== "posts")
    return new Response("Not found", { status: 404 });
  const app = collectionApp(context.url.origin, collection);
  const parts = context.params.path?.split("/") ?? [];
  if (parts.length === 2 && parts[1] === "thumbnail")
    return adminThumbnail(context, parts[0]!, app.service.readMedia);
  return app.pages.api(context);
};
