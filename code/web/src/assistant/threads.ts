import type { Thread, ThreadStore } from "../threads/store";

/**
 * The admin's writing threads, built on the generic thread store:
 *
 * - desk: the admin-wide parent thread, always present (`writing-desk`).
 * - post: one per post (`post-<post UUID>`), a child of the desk, about that post.
 * - idea: a subthread started from any thread to explore one idea.
 */
export const KINDS = { desk: "writing.desk", post: "writing.post", idea: "writing.idea" } as const;
export type WritingKind = (typeof KINDS)[keyof typeof KINDS];
export const DESK_ID = "writing-desk";

export function writingThreads(store: ThreadStore) {
  const desk = () => store.create({ id: DESK_ID, kind: KINDS.desk, title: "Writing desk" });

  /** A post's thread. Its title follows the post's. */
  async function forPost(postId: string, title: string): Promise<Thread> {
    await desk();
    const label = title.trim() || "Untitled post";
    const thread = await store.create({
      id: `post-${postId}`, kind: KINDS.post, title: label, parentId: DESK_ID, subjectType: "post", subjectId: postId,
    });
    if (thread.title === label) return thread;
    await store.rename(thread.id, label);
    return { ...thread, title: label };
  }

  /** A subthread for one idea, started from a message in `parent`. It stays about the parent's post, if any. */
  function startIdea(parent: Thread, input: { title: string; brief: string; fromMessageId?: string }): Promise<Thread> {
    return store.create({
      kind: KINDS.idea,
      title: input.title.trim().slice(0, 120) || "Idea",
      parentId: parent.id,
      parentMessageId: input.fromMessageId ?? null,
      subjectType: parent.subjectType,
      subjectId: parent.subjectId,
      metadata: { brief: input.brief.trim().slice(0, 4000) },
    });
  }

  return { desk, forPost, startIdea };
}

export const briefOf = (thread: Thread) => (typeof thread.metadata.brief === "string" ? thread.metadata.brief : "");
