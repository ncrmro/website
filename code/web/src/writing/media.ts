import { env } from "quiescent:runtime";
import { documentCachePolicy, type RouteCache } from "@quiescent/astro";
import { writingApp } from "./app";
export async function publishedMedia(id: string, filename: string, cache?: RouteCache) {
  for (const collection of ["posts"] as const) {
    const object = await writingApp(env, collection).service.readMedia(id, filename);
    if (!object) continue;
    cache?.set(documentCachePolicy({ collection }, id));
    return new Response(object.body, {
      headers: {
        "Content-Type": object.contentType,
        "Content-Length": String(object.size),
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  return new Response("Not found", { status: 404 });
}
