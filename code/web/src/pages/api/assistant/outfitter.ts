import type { APIRoute } from "astro";
import { assistantLogin, fail, json } from "../../../assistant/server";
import { OutfitterError } from "../../../assistant/outfitter-login";

/** The admin's Outfitter sign-in: its status, and connect / poll / disconnect. */
export const GET: APIRoute = async (context) => {
  context.cache.set(false);
  return json(await assistantLogin().status());
};

const ACTIONS = ["connect", "poll", "disconnect"] as const;
export const POST: APIRoute = async (context) => {
  context.cache.set(false);
  const body = await context.request.json().catch(() => null) as { action?: string } | null;
  const action = ACTIONS.find((name) => name === body?.action);
  if (!action) return fail("Invalid input", 400);
  const login = assistantLogin();
  try {
    if (action === "connect") return json(await login.start());
    if (action === "poll") return json(await login.poll());
    return json(await login.disconnect());
  } catch (cause) {
    if (cause instanceof OutfitterError) return fail(cause.message, 502);
    return fail("Could not reach Outfitter. Try again.", 502);
  }
};
