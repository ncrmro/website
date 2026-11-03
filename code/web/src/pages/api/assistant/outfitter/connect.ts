import type { APIRoute } from "astro";
import { assistantLogin, fail } from "../../../../assistant/server";
import { OutfitterError } from "../../../../assistant/outfitter-login";
import { safeReturn } from "../../../../assistant/outfitter-routes";

/** Connect Outfitter: a same-origin form post that sends the writer to Outfitter's consent page. */
export const POST: APIRoute = async (context) => {
  context.cache.set(false);
  const form = await context.request.formData().catch(() => null);
  const returnTo = safeReturn(form?.get("returnTo"));
  const callback = new URL("/api/assistant/outfitter/callback", context.url.origin).href;
  try {
    const consent = await assistantLogin().authorize(callback, returnTo);
    return new Response(null, { status: 303, headers: { Location: consent, "Cache-Control": "private, no-store" } });
  } catch (cause) {
    return fail(cause instanceof OutfitterError ? cause.message : "Could not reach Outfitter. Try again.", 502);
  }
};
