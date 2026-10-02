import { canPublish } from "./writing/policy";
import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { writingAuthor } from "./writing/auth";
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const editor = /^\/write\/?$/.test(path) || /^\/posts\/(new\/?$|[^/]+\/edit\/?$)/.test(path);
  const api = path.startsWith("/api/documents/") || path.startsWith("/api/tags/");
  const privateRoute = editor || api || path.startsWith("/api/auth/") || path.startsWith("/_server-islands/") || path.startsWith("/drafts/");
  if (privateRoute) context.cache.set(false);
  if ((editor || api) && !(await writingAuthor(context.request, env))) {
    const response = editor ? context.redirect("/api/auth/signin") : new Response("Sign in to write", { status: 401 });
    response.headers.set("Cache-Control", "private, no-store"); return response;
  }
  if (path.startsWith("/api/documents/") && !canPublish(context.url.hostname))
    return new Response("Publishing is available on ncrmro.com. Version previews are read-only.", {status: 403, headers: {"Cache-Control": "private, no-store"}});
  if (api && !["GET", "HEAD", "OPTIONS"].includes(context.request.method) && context.request.headers.get("Origin") !== context.url.origin)
    return new Response("Invalid origin", { status: 403, headers: { "Cache-Control": "private, no-store" } });
  if (api && !env.SERVICE_TOKEN) return Response.json({error: "Writing is awaiting its repository connection (SERVICE_TOKEN)."}, {status: 503, headers: {"Cache-Control":"private, no-store"}});
  const response = await next();
  if (privateRoute) response.headers.set("Cache-Control", "private, no-store");
  return response;
});
