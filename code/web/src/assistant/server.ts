import { env } from "cloudflare:workers";
import type { RouteCache } from "@quiescent/astro";
import type { DocumentDraft } from "@quiescent/server";
import { collectionApp } from "../writing/pages";
import { threadStore } from "../threads/store";
import type { PostSource } from "./tools";
import { outfitterOrigin } from "./model";
import { outfitterLogin } from "./outfitter-login";

const noStore = { "Cache-Control": "private, no-store" };

export function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: noStore });
}
export function fail(message: string, status: number): Response {
  return new Response(message, { status, headers: noStore });
}

export function assistantStore() {
  return threadStore(env.ASSISTANT_DB);
}

/** Saved posts from the private admin listing (the D1 document cache), read once per request. */
export function postSource(origin: string, cache?: RouteCache): PostSource {
  let listing: Promise<DocumentDraft[]> | undefined;
  return () => {
    listing ??= collectionApp(origin, "posts", cache).service.listDocuments() as Promise<DocumentDraft[]>;
    return listing;
  };
}

/** The admin's Outfitter login, stored in ASSISTANT_DB. */
export function assistantLogin() {
  return outfitterLogin({
    db: env.ASSISTANT_DB,
    secret: env.AUTH_SECRET ?? "",
    origin: outfitterOrigin(env),
  });
}
