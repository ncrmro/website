import { env } from "cloudflare:workers";
import type { CacheFetch } from "@quiescent/astro";

export { env };
export function hostedMedia() {
  return undefined;
}
// Same-Worker public fetch bypasses the Worker. Its service binding includes Workers Cache.
export const warmFetch: CacheFetch = (input) =>
  env.WRITING_SELF.fetch(input instanceof Request ? input.url : String(input), {
    redirect: "manual",
  });

export const transformImage: import("@quiescent/astro/images").TransformImage = async (
  source,
  options,
) => {
  if (!source.body) return new Response("Not found", { status: 404 });
  const result = await env.IMAGES.input(source.body)
    .transform({ width: options.width, height: options.height, fit: "scale-down" })
    .output({ format: `image/${options.format}`, quality: options.quality });
  return result.response();
};
