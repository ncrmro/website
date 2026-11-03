import type { UIMessage } from "ai";

/**
 * Generic conversation threads on D1, after ai-outfitter's `@ai-outfitter/threads`
 * (a thread row plus its messages), reduced to what a single-author site needs.
 *
 * A thread has a free-form `kind` chosen by the feature that uses it, an optional
 * parent thread (and the parent message it was started from), an optional link to
 * one thing it is about (`subjectType`/`subjectId`), and JSON `metadata` for
 * anything feature-specific. Messages are AI SDK `UIMessage`s, saved by id.
 * This module knows nothing about posts or the writing assistant.
 */
export interface Thread {
  id: string;
  kind: string;
  title: string;
  parentId: string | null;
  parentMessageId: string | null;
  subjectType: string | null;
  subjectId: string | null;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
export interface ThreadSummary extends Thread {
  messageCount: number;
}
export type NewThread = Pick<Thread, "kind" | "title"> & Partial<Pick<Thread,
  "id" | "parentId" | "parentMessageId" | "subjectType" | "subjectId" | "metadata">>;

/**
 * Ordered schema migrations. Append a new entry to change the schema; never edit
 * an applied one. Applied versions are recorded in `thread_schema`.
 */
const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      parent_id TEXT REFERENCES threads(id) ON DELETE SET NULL,
      parent_message_id TEXT,
      subject_type TEXT,
      subject_id TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS threads_parent_idx ON threads(parent_id, updated_at)`,
    `CREATE INDEX IF NOT EXISTS threads_subject_idx ON threads(subject_type, subject_id)`,
    `CREATE TABLE IF NOT EXISTS thread_messages (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL UNIQUE,
      thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      parts TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS thread_messages_thread_idx ON thread_messages(thread_id, seq)`,
  ],
];

const migrated = new WeakMap<D1Database, Promise<void>>();
/** Brings the schema up to date once per isolate. Migrations must be idempotent. */
function migrate(db: D1Database): Promise<void> {
  let pending = migrated.get(db);
  if (!pending) {
    pending = (async () => {
      await db.prepare(`CREATE TABLE IF NOT EXISTS thread_schema (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)`).run();
      const row = await db.prepare(`SELECT MAX(version) AS version FROM thread_schema`).first<{ version: number | null }>();
      for (let version = (row?.version ?? 0) + 1; version <= MIGRATIONS.length; version++) {
        await db.batch([
          ...MIGRATIONS[version - 1]!.map((statement) => db.prepare(statement)),
          db.prepare(`INSERT OR IGNORE INTO thread_schema (version, applied_at) VALUES (?, ?)`).bind(version, Date.now()),
        ]);
      }
    })();
    pending.catch(() => migrated.delete(db));
    migrated.set(db, pending);
  }
  return pending;
}

type ThreadRow = {
  id: string; kind: string; title: string; parent_id: string | null; parent_message_id: string | null;
  subject_type: string | null; subject_id: string | null; metadata: string; created_at: number; updated_at: number;
  message_count?: number;
};
const toThread = (row: ThreadRow): Thread => ({
  id: row.id, kind: row.kind, title: row.title, parentId: row.parent_id, parentMessageId: row.parent_message_id,
  subjectType: row.subject_type, subjectId: row.subject_id, metadata: JSON.parse(row.metadata || "{}"),
  createdAt: row.created_at, updatedAt: row.updated_at,
});
const toSummary = (row: ThreadRow): ThreadSummary => ({ ...toThread(row), messageCount: row.message_count ?? 0 });
const SUMMARY = `SELECT t.*, (SELECT COUNT(*) FROM thread_messages m WHERE m.thread_id = t.id) AS message_count FROM threads t`;

/** Plain text of a message's text parts. */
export function messageText(message: Pick<UIMessage, "parts">): string {
  return message.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("\n").trim();
}

export function threadStore(db: D1Database, now = () => Date.now()) {
  async function get(id: string): Promise<Thread | null> {
    await migrate(db);
    const row = await db.prepare(`SELECT * FROM threads WHERE id = ?`).bind(id).first<ThreadRow>();
    return row ? toThread(row) : null;
  }

  /** Creates a thread. With a known `id`, an existing thread is returned unchanged. */
  async function create(input: NewThread): Promise<Thread> {
    await migrate(db);
    const id = input.id ?? crypto.randomUUID();
    const at = now();
    await db.prepare(
      `INSERT INTO threads (id, kind, title, parent_id, parent_message_id, subject_type, subject_id, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
    ).bind(
      id, input.kind, input.title, input.parentId ?? null, input.parentMessageId ?? null,
      input.subjectType ?? null, input.subjectId ?? null, JSON.stringify(input.metadata ?? {}), at, at,
    ).run();
    return (await get(id))!;
  }

  async function rename(id: string, title: string): Promise<void> {
    await migrate(db);
    await db.prepare(`UPDATE threads SET title = ? WHERE id = ?`).bind(title, id).run();
  }

  /** Threads newest first, optionally only one parent's children. */
  async function list(filter: { parentId?: string } = {}): Promise<ThreadSummary[]> {
    await migrate(db);
    const query = filter.parentId === undefined
      ? db.prepare(`${SUMMARY} ORDER BY t.updated_at DESC LIMIT 500`)
      : db.prepare(`${SUMMARY} WHERE t.parent_id = ? ORDER BY t.updated_at DESC`).bind(filter.parentId);
    return (await query.all<ThreadRow>()).results.map(toSummary);
  }

  /** The latest `limit` messages, oldest first. */
  async function messages(threadId: string, limit = 200): Promise<UIMessage[]> {
    await migrate(db);
    const { results } = await db.prepare(
      `SELECT * FROM (SELECT id, role, parts, metadata, seq FROM thread_messages WHERE thread_id = ? ORDER BY seq DESC LIMIT ?) ORDER BY seq`,
    ).bind(threadId, limit).all<{ id: string; role: UIMessage["role"]; parts: string; metadata: string | null }>();
    return results.map((row) => ({
      id: row.id, role: row.role, parts: JSON.parse(row.parts),
      ...(row.metadata ? { metadata: JSON.parse(row.metadata) } : {}),
    }));
  }

  /** Saves messages by id: new ones are appended, known ones replaced. A message never moves between threads. */
  async function save(threadId: string, list: UIMessage[]): Promise<void> {
    if (!list.length) return;
    await migrate(db);
    const at = now();
    await db.batch([
      ...list.map((message) => db.prepare(
        `INSERT INTO thread_messages (id, thread_id, role, text, parts, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET text = excluded.text, parts = excluded.parts,
           metadata = excluded.metadata, updated_at = excluded.updated_at
         WHERE thread_messages.thread_id = excluded.thread_id`,
      ).bind(
        message.id, threadId, message.role, messageText(message), JSON.stringify(message.parts),
        message.metadata === undefined ? null : JSON.stringify(message.metadata), at, at,
      )),
      db.prepare(`UPDATE threads SET updated_at = ? WHERE id = ?`).bind(at, threadId),
    ]);
  }

  /** Recent messages as plain text, for another thread or model to read. */
  async function transcript(threadId: string, limit = 40): Promise<{ role: string; text: string }[]> {
    await migrate(db);
    const { results } = await db.prepare(
      `SELECT * FROM (SELECT role, text, seq FROM thread_messages WHERE thread_id = ? ORDER BY seq DESC LIMIT ?) ORDER BY seq`,
    ).bind(threadId, limit).all<{ role: string; text: string }>();
    return results.filter((row) => row.text).map(({ role, text }) => ({ role, text }));
  }

  return { get, create, rename, list, messages, save, transcript };
}
export type ThreadStore = ReturnType<typeof threadStore>;
