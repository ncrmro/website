import { tool } from "ai";
import { z } from "zod";
import type { DocumentDraft } from "@quiescent/server";
import { matchesSearch } from "../writing/listing-view";
import type { ThreadRecord, ThreadStore } from "./store";

/** The posts the assistant may read: the private admin listing, never a Git branch checkout. */
export type PostSource = () => Promise<DocumentDraft[]>;

const STATES: Record<string, string> = { published: "published", draft: "draft", "unpublished-changes": "published with unpublished changes" };
function postSummary(draft: DocumentDraft) {
  const meta = draft.document.frontmatter;
  return {
    id: draft.document.id,
    title: String(meta.title || "Untitled"),
    state: STATES[draft.state] ?? draft.state,
    date: String(meta.publish_date ?? draft.document.publishedAt ?? draft.document.createdAt ?? ""),
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    description: typeof meta.description === "string" ? meta.description : "",
    words: draft.document.body.split(/\s+/).filter(Boolean).length,
  };
}

/** Cards the sidebar renders. They end the step: a question waits for his answer. */
const cardTools = {
  askQuestion: tool({
    description: "Ask the writer one specific question, shown as a card he can answer by voice, typing or a quick reply.",
    inputSchema: z.object({
      question: z.string().describe("One question, specific to what he said or wrote."),
      why: z.string().optional().describe("Half a sentence on why it matters for the piece."),
      replies: z.array(z.string()).max(4).optional().describe("Up to 4 short quick replies, when natural answers exist."),
    }),
    execute: async () => "Shown to the writer. Wait for his answer.",
  }),
  suggestIdeas: tool({
    description: "Offer two or three distinct angles to write from, shown as cards.",
    inputSchema: z.object({
      ideas: z.array(z.object({
        title: z.string().describe("Working title."),
        angle: z.string().describe("The angle in one sentence."),
        opening: z.string().describe("A possible opening line in his voice."),
      })).min(1).max(4),
    }),
    execute: async () => "Shown to the writer.",
  }),
};

export function assistantTools(thread: ThreadRecord, store: ThreadStore, posts: PostSource) {
  const readingTools = {
    listPosts: tool({
      description: "List his saved posts (published and drafts) with id, title, state, date, tags and length. Optional search terms.",
      inputSchema: z.object({ query: z.string().optional() }),
      execute: async ({ query }) => {
        const list = await posts();
        return list.filter((draft) => !query || matchesSearch(draft, query)).slice(0, 150).map(postSummary);
      },
    }),
    readPost: tool({
      description: "Read one post's metadata and full Markdown body by id.",
      inputSchema: z.object({ id: z.string() }),
      execute: async ({ id }) => {
        const draft = (await posts()).find((item) => item.document.id === id);
        if (!draft) return { error: "No post with that id." };
        return { ...postSummary(draft), body: `<post>\n${draft.document.body.slice(0, 60_000)}\n</post>` };
      },
    }),
    startSubthread: tool({
      description: "Start a subthread under this one to explore an idea separately. Use when he agrees or asks.",
      inputSchema: z.object({
        title: z.string().describe("Short title for the idea."),
        brief: z.string().describe("What to explore, with the relevant things he already said."),
      }),
      execute: async ({ title, brief }) => {
        const child = await store.startSubthread(thread.id, title, brief);
        return { threadId: child.id, title: child.title };
      },
    }),
  };
  if (thread.type !== "writing.desk") return { ...cardTools, ...readingTools };
  return {
    ...cardTools,
    ...readingTools,
    listThreads: tool({
      description: "List every assistant thread: post threads and idea subthreads, with parent, linked post id and size.",
      inputSchema: z.object({}),
      execute: async () => (await store.all()).map(({ id, type, title, parentId, contextId, entries, updatedAt }) => ({
        id, type, title, parentId, postId: contextId, entries, updatedAt: new Date(updatedAt).toISOString(),
      })),
    }),
    readThread: tool({
      description: "Read a thread's recent conversation as text.",
      inputSchema: z.object({ id: z.string() }),
      execute: async ({ id }) => {
        const target = await store.get(id);
        if (!target) return { error: "No thread with that id." };
        return { title: target.title, brief: target.brief, transcript: `<transcript>\n${await store.transcript(id)}\n</transcript>` };
      },
    }),
  };
}
