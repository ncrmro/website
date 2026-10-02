declare module "quiescent:runtime" {
 export const env: Env;
 export const warmFetch: import("@quiescent/astro").CacheFetch;
 export function thumbnailImage(body: ReadableStream<Uint8Array>): Promise<Response>;
 export const transformImage: import("@quiescent/astro/images").TransformImage;
}
