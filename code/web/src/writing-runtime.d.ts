declare module "quiescent:runtime" {
 export const env: Env;
 export const warmFetch: import("@quiescent/astro").CacheFetch;
 export const transformImage: import("@quiescent/astro/images").TransformImage;
}
