import type { APIRoute } from "astro";
import { z } from "zod";
import { assistantStore, fail, json } from "../../../../assistant/server";

/** All threads, newest first (the desk's thread list). */
export const GET: APIRoute = async (context) => {
  context.cache.set(false);
  const store = assistantStore();
  await store.desk();
  return json(await store.all());
};

const open = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("desk") }),
  z.object({ kind: z.literal("post"), postId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/), title: z.string().max(300).default("") }),
]);

/** Opens (creating on first use) the desk thread or a post's thread. */
export const POST: APIRoute = async (context) => {
  context.cache.set(false);
  const input = open.safeParse(await context.request.json().catch(() => null));
  if (!input.success) return fail("Invalid input", 400);
  const store = assistantStore();
  const thread = input.data.kind === "desk" ? await store.desk() : await store.forPost(input.data.postId, input.data.title);
  return json(thread);
};
