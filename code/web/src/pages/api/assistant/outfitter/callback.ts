import type { APIRoute } from "astro";
import { assistantLogin } from "../../../../assistant/server";
import { OutfitterError } from "../../../../assistant/outfitter-login";
import { safeReturn, withOutcome } from "../../../../assistant/outfitter-routes";

/** Outfitter sends the writer back here with a code (or an error) after the consent page. */
export const GET: APIRoute = async (context) => {
  context.cache.set(false);
  let location: string;
  try {
    location = withOutcome(safeReturn(await assistantLogin().callback(context.url.searchParams)), {});
  } catch (cause) {
    const error = cause instanceof OutfitterError ? cause.message : "Could not reach Outfitter. Try again.";
    location = withOutcome("/admin", { error });
  }
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
};
