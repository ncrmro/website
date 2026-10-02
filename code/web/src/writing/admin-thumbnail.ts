import type { APIContext } from "astro";
import { thumbnailImage } from "quiescent:runtime";
import { documentErrorResponse, type MediaStorage } from "@quiescent/server";

/** Private listing artwork: never fetch full-size originals into the browser. */
export async function adminThumbnail(
  context: APIContext,
  id: string,
  readMedia: (id: string, filename: string, branch?: string) => ReturnType<MediaStorage["read"]>,
): Promise<Response> {
  if (context.request.method !== "GET") return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
  const filename = context.url.searchParams.get("filename");
  if (!filename) return new Response("Missing filename", { status: 400 });
  try {
    const image = await readMedia(id, filename, context.url.searchParams.get("branch") ?? undefined);
    if (!image) return new Response("Not found", { status: 404 });
    const thumbnail = await thumbnailImage(image.body);
    return new Response(thumbnail.body, { status: thumbnail.status, headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    return documentErrorResponse(error);
  }
}
