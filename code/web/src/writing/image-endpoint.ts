import { transformImage } from "quiescent:runtime";
import { documentImageResponse } from "@quiescent/astro/images";
import { documentErrorResponse } from "@quiescent/server";
import type { APIRoute } from "astro";
import { publishedMedia } from "./media";
export const GET: APIRoute = async ({ request, cache, logger }) => {
  try {
    return await documentImageResponse({
      request,
      cache,
      logger,
      source: (id, filename) => publishedMedia(id, filename, cache, new URL(request.url).origin),
      transform: transformImage,
    });
  } catch (error) {
    return documentErrorResponse(error);
  }
};
