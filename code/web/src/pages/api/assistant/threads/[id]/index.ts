import type { APIRoute } from "astro";
import { assistantStore, fail, json } from "../../../../../assistant/server";

/** One thread with its parent, subthreads and saved messages. */
export const GET: APIRoute = async (context) => {
  context.cache.set(false);
  const store = assistantStore();
  const thread = await store.get(String(context.params.id));
  if (!thread) return fail("Not found", 404);
  const [parent, children, messages] = await Promise.all([
    thread.parentId ? store.get(thread.parentId) : null,
    store.children(thread.id),
    store.messages(thread.id),
  ]);
  return json({ thread, parent, children, messages });
};
