import type { APIContext } from "astro";
import type { Collection } from "./collections";
import { collectionApp } from "./pages";
export async function reader(
  context: Pick<APIContext, "url" | "cache"> & { response: { headers: Headers } },
  collection: Collection,
  slug?: string,
) {
  const { service, pages } = collectionApp(context.url.origin, collection);
  const documents = await service.listPublished();
  const document = slug
    ? (documents.find((draft) => draft.document.frontmatter.slug === slug) ?? null)
    : null;
  pages.set(context.cache, document?.document.id);
  context.response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  context.response.headers.set("X-Quiescent-Rendered", crypto.randomUUID());
  context.response.headers.set("X-Quiescent-Revision", document?.headSha ?? "");
  if (slug && !document)
    return new Response("Not found", { status: 404, headers: context.response.headers });
  return { post: document, posts: document ? [document] : documents, collection };
}
