import type { UIMessage } from "ai";

/**
 * Writing assistant threads, modeled on ai-outfitter's `@ai-outfitter/threads`
 * (a `chats` row is a thread, a `messages` row one of its entries), reduced to
 * this single-author site: no owners, visibility, leases or providers.
 *
 * - The desk thread (`writing-desk`) is the admin-wide parent. It is always there.
 * - Each post has one thread (`post-<post UUID>`), a child of the desk.
 * - Any thread can start subthreads (`parent_id`), e.g. an idea to explore.
 *
 * Threads never write documents; Git and Quiescent stay the only post store.
 */
export const DESK_THREAD_ID = "writing-desk";
export type ThreadType = "writing.desk" | "writing.post" | "writing.idea";

export interface ThreadRecord {
  id: string;
  type: ThreadType;
  title: string;
  parentId: string | null;
  contextType: string | null;
  contextId: string | null;
  brief: string | null;
  createdAt: number;
  updatedAt: number;
}
export interface ThreadSummary extends ThreadRecord {
  entries: number;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS assistant_threads (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    parent_id TEXT REFERENCES assistant_threads(id) ON DELETE SET NULL,
    context_type TEXT,
    context_id TEXT,
    brief TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS assistant_threads_parent_idx ON assistant_threads(parent_id, updated_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS assistant_threads_context_idx
    ON assistant_threads(type, context_type, context_id) WHERE context_id IS NOT NULL`,
  `CREATE TABLE IF NOT EXISTS assistant_entries (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    thread_id TEXT NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    parts TEXT NOT NULL,
    metadata TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS assistant_entries_thread_idx ON assistant_entries(thread_id, seq)`,
];

const ready = new WeakMap<D1Database, Promise<void>>();
/** Tables are created on first use, like the document cache; statements are idempotent. */
function ensureSchema(db: D1Database): Promise<void> {
  let pending = ready.get(db);
  if (!pending) {
    pending = db.batch(SCHEMA.map((statement) => db.prepare(statement))).then(() => undefined);
    pending.catch(() => ready.delete(db));
    ready.set(db, pending);
  }
  return pending;
}

type ThreadRow = {
  id: string; type: ThreadType; title: string; parent_id: string | null; context_type: string | null;
  context_id: string | null; brief: string | null; created_at: number; updated_at: number; entries?: number;
};
const toThread = (row: ThreadRow): ThreadRecord => ({
  id: row.id, type: row.type, title: row.title, parentId: row.parent_id, contextType: row.context_type,
  contextId: row.context_id, brief: row.brief, createdAt: row.created_at, updatedAt: row.updated_at,
});
const SUMMARY = `SELECT t.*, (SELECT COUNT(*) FROM assistant_entries e WHERE e.thread_id = t.id) AS entries
  FROM assistant_threads t`;

/** Plain text of a message's text parts. */
export function messageText(message: Pick<UIMessage, "parts">): string {
  return message.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("\n").trim();
}

export function threadStore(db: D1Database, now = () => Date.now()) {
  async function get(id: string): Promise<ThreadRecord | null> {
    await ensureSchema(db);
    const row = await db.prepare(`SELECT * FROM assistant_threads WHERE id = ?`).bind(id).first<ThreadRow>();
    return row ? toThread(row) : null;
  }

  async function insert(thread: Omit<ThreadRecord, "createdAt" | "updatedAt">): Promise<ThreadRecord> {
    await ensureSchema(db);
    const at = now();
    await db.prepare(
      `INSERT INTO assistant_threads (id, type, title, parent_id, context_type, context_id, brief, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
    ).bind(thread.id, thread.type, thread.title, thread.parentId, thread.contextType, thread.contextId, thread.brief, at, at).run();
    return (await get(thread.id))!;
  }

  /** The admin-wide parent thread; created on first use. */
  async function desk(): Promise<ThreadRecord> {
    return (await get(DESK_THREAD_ID)) ?? insert({
      id: DESK_THREAD_ID, type: "writing.desk", title: "Writing desk", parentId: null,
      contextType: null, contextId: null, brief: null,
    });
  }

  /** A post's own thread, a child of the desk. The title follows the post's. */
  async function forPost(postId: string, title: string): Promise<ThreadRecord> {
    await desk();
    const id = `post-${postId}`;
    const existing = await get(id);
    const label = title.trim() || "Untitled post";
    if (existing) {
      if (existing.title !== label) {
        await db.prepare(`UPDATE assistant_threads SET title = ? WHERE id = ?`).bind(label, id).run();
        return { ...existing, title: label };
      }
      return existing;
    }
    return insert({ id, type: "writing.post", title: label, parentId: DESK_THREAD_ID, contextType: "post", contextId: postId, brief: null });
  }

  /** A subthread started from any thread, seeded with a brief of what to explore. */
  async function startSubthread(parentId: string, title: string, brief: string): Promise<ThreadRecord> {
    const parent = await get(parentId);
    if (!parent) throw new Error("Parent thread not found");
    return insert({
      id: `idea-${crypto.randomUUID()}`, type: "writing.idea", title: title.trim().slice(0, 120) || "Idea",
      parentId, contextType: parent.contextType, contextId: parent.contextId, brief: brief.trim().slice(0, 4000),
    });
  }

  async function children(parentId: string): Promise<ThreadSummary[]> {
    await ensureSchema(db);
    const { results } = await db.prepare(`${SUMMARY} WHERE t.parent_id = ? ORDER BY t.updated_at DESC`).bind(parentId).all<ThreadRow>();
    return results.map((row) => ({ ...toThread(row), entries: row.entries ?? 0 }));
  }

  async function all(): Promise<ThreadSummary[]> {
    await ensureSchema(db);
    const { results } = await db.prepare(`${SUMMARY} ORDER BY t.updated_at DESC LIMIT 200`).all<ThreadRow>();
    return results.map((row) => ({ ...toThread(row), entries: row.entries ?? 0 }));
  }

  async function messages(threadId: string, limit = 200): Promise<UIMessage[]> {
    await ensureSchema(db);
    const { results } = await db.prepare(
      `SELECT * FROM (SELECT id, role, parts, metadata, seq FROM assistant_entries WHERE thread_id = ? ORDER BY seq DESC LIMIT ?) ORDER BY seq`,
    ).bind(threadId, limit).all<{ id: string; role: UIMessage["role"]; parts: string; metadata: string | null }>();
    return results.map((row) => ({
      id: row.id, role: row.role, parts: JSON.parse(row.parts),
      ...(row.metadata ? { metadata: JSON.parse(row.metadata) } : {}),
    }));
  }

  /** Saves messages by id: new ones are appended, known ones (a reply still growing) are replaced. */
  async function save(threadId: string, list: UIMessage[]): Promise<void> {
    if (!list.length) return;
    await ensureSchema(db);
    const at = now();
    await db.batch([
      ...list.map((message) => db.prepare(
        `INSERT INTO assistant_entries (id, thread_id, role, content, parts, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET content = excluded.content, parts = excluded.parts,
           metadata = excluded.metadata, updated_at = excluded.updated_at
         WHERE assistant_entries.thread_id = excluded.thread_id`,
      ).bind(
        message.id, threadId, message.role, messageText(message), JSON.stringify(message.parts),
        message.metadata === undefined ? null : JSON.stringify(message.metadata), at, at,
      )),
      db.prepare(`UPDATE assistant_threads SET updated_at = ? WHERE id = ?`).bind(at, threadId),
    ]);
  }

  /** A thread's recent conversation as plain text, for the desk to read. */
  async function transcript(threadId: string, limit = 40): Promise<string> {
    await ensureSchema(db);
    const { results } = await db.prepare(
      `SELECT * FROM (SELECT role, content, seq FROM assistant_entries WHERE thread_id = ? ORDER BY seq DESC LIMIT ?) ORDER BY seq`,
    ).bind(threadId, limit).all<{ role: string; content: string }>();
    return results.filter((row) => row.content).map((row) => `${row.role === "user" ? "Writer" : "Assistant"}: ${row.content}`).join("\n\n");
  }

  return { get, desk, forPost, startSubthread, children, all, messages, save, transcript };
}
export type ThreadStore = ReturnType<typeof threadStore>;
