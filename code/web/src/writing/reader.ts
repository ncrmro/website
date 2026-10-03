import type { APIContext } from "astro";
import type { Collection } from "./collections";
import { collectionApp } from "./pages";
export async function reader(
  context: Pick<APIContext, "url" | "cache"> & { response: { headers: Headers } },
  collection: Collection,
  slug?: string,
) {
  const { service, pages } = collectionApp(context.url.origin, collection, context.cache);
  const result = slug
    ? await service.getPublishedBySlugWithStatus(slug)
    : await service.listPublishedWithStatus();
  const document = "document" in result ? result.document : null;
  const documents = "documents" in result ? result.documents : [];
  pages.set(context.cache, document?.document.id, result.cache);
  pages.setReaderHeaders(context.response.headers, document?.headSha);
  if (slug && !document)
    return new Response("Not found", { status: 404, headers: context.response.headers });
  return { post: document, posts: document ? [document] : documents, collection };
}
