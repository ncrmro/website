import type { APIRoute } from "astro";
import { assistantLogin, fail, json } from "../../../../assistant/server";

/** The admin's Outfitter sign-in status, and Disconnect. */
export const GET: APIRoute = async (context) => {
  context.cache.set(false);
  return json(await assistantLogin().status());
};

export const POST: APIRoute = async (context) => {
  context.cache.set(false);
  const body = await context.request.json().catch(() => null) as { action?: string } | null;
  if (body?.action !== "disconnect") return fail("Invalid input", 400);
  return json(await assistantLogin().disconnect());
};
