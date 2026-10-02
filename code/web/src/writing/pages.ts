import { env, warmFetch } from "quiescent:runtime";
import { astroDocuments } from "@quiescent/astro";
import { writingApp, writingAuthor } from "./app";
import { type Collection, documentPath, indexPaths } from "./collections";
export function collectionApp(origin: string, collection: Collection = "posts") {
  const { service, media } = writingApp(env, collection);
  const pages = astroDocuments({
    store: service,
    media,
    readMedia: service.readMedia,
    collection,
    origin,
    apiBase: `/api/documents/${collection}`,
    fetch: warmFetch,
    documentPath: (document) => documentPath(collection, document),
    indexPaths: indexPaths(collection),
    authorize: (request) => writingAuthor(request, env),
  });
  return { service, pages };
}
