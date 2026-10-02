import { documentErrorResponse } from "@quiescent/server";
import type { APIRoute } from "astro";
import { publishedMedia } from "../../writing/media";
export const GET: APIRoute = async ({ params, cache }) => {
  try {
    const [id, filename, ...extra] = (params.path ?? "").split("/");
    if (!id || !filename || extra.length) return new Response("Not found", { status: 404 });
    return await publishedMedia(id, filename, cache);
  } catch (error) {
    return documentErrorResponse(error);
  }
};
