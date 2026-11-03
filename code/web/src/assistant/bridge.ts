import type { EditorHost } from "@quiescent/editor/writing";

/**
 * Hands the editor's state to the assistant island. The editor is mounted by a
 * plain script and the island by React; both import this module, which the
 * browser loads once.
 */
export interface EditorPost {
  id: string;
  title: string;
}
export interface DraftSnapshot {
  title: string;
  description: string;
  tags: string[];
  body: string;
}

let host: EditorHost | null = null;
let post: EditorPost | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function setEditorHost(next: EditorHost | null) {
  host = next;
}
export function setEditorPost(next: EditorPost | null) {
  post = next;
  notify();
}
export function editorPost(): EditorPost | null {
  return post;
}
export function subscribeEditorPost(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The draft as it is on screen right now, read at send time. */
export function readDraft(): DraftSnapshot | undefined {
  const document = host?.readDocument();
  if (!document) return undefined;
  const meta = document.frontmatter as Record<string, unknown>;
  return {
    title: typeof meta.title === "string" ? meta.title : "",
    description: typeof meta.description === "string" ? meta.description : "",
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    body: document.body,
  };
}
