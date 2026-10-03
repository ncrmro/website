import { env, warmFetch } from "quiescent:runtime";
import { astroDocuments, type RouteCache } from "@quiescent/astro";
import { writingApp, writingAuthor } from "./app";
import { type Collection, type ExampleMetadata, documentPath, indexPaths } from "./collections";
export function collectionApp(origin: string, collection: Collection = "posts", cache?: RouteCache) {
  let pages: ReturnType<typeof astroDocuments<ExampleMetadata>>;
  const { service, media } = writingApp(env, collection, async (previous, next, retry) => {
    if (cache) await pages.afterRefresh(cache, previous.map(d => d.document), next.map(d => d.document), retry);
  });
  pages = astroDocuments({
    store: service,
    media,
    readMedia: service.readMedia,
    collection,
    origin,
    maxAge: 3600,
    apiBase: `/api/documents/${collection}`,
    fetch: warmFetch,
    documentPath: (document) => documentPath(collection, document),
    indexPaths: indexPaths(collection),
    authorize: (request) => writingAuthor(request, env),
  });
  return { service, pages };
}
