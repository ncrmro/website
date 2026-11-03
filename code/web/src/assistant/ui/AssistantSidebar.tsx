import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { editorPost, readDraft, subscribeEditorPost } from "../bridge";
import { DictateButton } from "./BrainDump";
import { OutfitterLogin } from "./OutfitterLogin";

import type { Thread as StoredThread } from "../../threads/store";
import { KINDS, type WritingKind } from "../threads";

type Thread = StoredThread & { kind: WritingKind; messageCount?: number };
interface ThreadView {
  thread: Thread;
  parent: Thread | null;
  children: Thread[];
  messages: UIMessage[];
}
type Scope = "desk" | "post";

const API = "/api/assistant/threads";
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
  return response.json() as Promise<T>;
}
const openThread = (body: unknown) =>
  request<Thread>(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const loadView = (id: string) => request<ThreadView>(`${API}/${encodeURIComponent(id)}`);

const OPEN_KEY = "writing-assistant-open";
function initiallyOpen(): boolean {
  try {
    const saved = localStorage.getItem(OPEN_KEY);
    if (saved !== null) return saved === "true";
  } catch { /* storage unavailable */ }
  return window.matchMedia("(min-width: 1100px)").matches;
}

/**
 * The admin's writing assistant. On /admin it opens the writing desk, the
 * admin-wide thread that can see every post; in the editor it opens the post's
 * own thread (a child of the desk). Any thread can hold subthreads.
 */
export default function AssistantSidebar({ scope }: { scope: Scope }) {
  const [open, setOpen] = useState(false);
  const [rootId, setRootId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [view, setView] = useState<ThreadView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => setOpen(initiallyOpen()), []);
  useEffect(() => {
    document.documentElement.classList.toggle("assistant-open", open);
    try { localStorage.setItem(OPEN_KEY, String(open)); } catch { /* storage unavailable */ }
  }, [open]);

  // The root thread: the desk, or the post being edited once the editor opens it.
  useEffect(() => {
    if (scope === "desk") {
      openThread({ kind: "desk" }).then((thread) => setRootId(thread.id), (cause: Error) => setError(cause.message));
      return;
    }
    let current: string | null = null;
    const sync = () => {
      const post = editorPost();
      if (!post || post.id === current) return;
      current = post.id;
      openThread({ kind: "post", postId: post.id, title: readDraft()?.title ?? post.title })
        .then((thread) => setRootId(thread.id), (cause: Error) => setError(cause.message));
    };
    sync();
    return subscribeEditorPost(sync);
  }, [scope]);
  useEffect(() => setThreadId(rootId), [rootId]);

  const refresh = useCallback(async (id: string) => {
    try {
      setView(await loadView(id));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the thread.");
    }
  }, []);
  useEffect(() => {
    setView(null);
    if (threadId) void refresh(threadId);
  }, [threadId, refresh]);

  return (
    <>
      <button type="button" className="assistant-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Close assistant" : "Assistant"}
      </button>
      <aside className="assistant-panel" hidden={!open} aria-label="Writing assistant">
        <header className="assistant-header">
          {view?.parent && (
            <button type="button" className="assistant-link" onClick={() => setThreadId(view.parent!.id)}>
              ‹ {view.parent.title}
            </button>
          )}
          <h2>{view?.thread.title ?? "Writing assistant"}</h2>
          <button type="button" className="assistant-close" aria-label="Close assistant" onClick={() => setOpen(false)}>×</button>
        </header>
        <OutfitterLogin />
        {view && <ThreadNav view={view} scope={scope} onOpen={setThreadId} />}
        {error && <p className="assistant-error" role="alert">{error}</p>}
        {!view && !error && <p className="assistant-muted">{scope === "post" ? "Opening this post's thread…" : "Opening the writing desk…"}</p>}
        {view && (
          <ThreadChat
            key={view.thread.id}
            view={view}
            withDraft={scope === "post"}
            onReplied={() => refresh(view.thread.id)}
            onOpenThread={setThreadId}
          />
        )}
      </aside>
    </>
  );
}

/** Subthreads, and on the desk every post thread. */
function ThreadNav({ view, scope, onOpen }: { view: ThreadView; scope: Scope; onOpen: (id: string) => void }) {
  const [all, setAll] = useState<Thread[] | null>(null);
  const isDesk = view.thread.kind === KINDS.desk;
  useEffect(() => {
    if (isDesk && scope === "desk") request<Thread[]>(API).then(setAll, () => setAll(null));
  }, [isDesk, scope, view.thread.updatedAt]);
  const posts = (all ?? []).filter((thread) => thread.kind === KINDS.post && (thread.messageCount ?? 0) > 0);
  const children = view.children.filter((thread) => thread.kind === KINDS.idea);
  if (!children.length && !posts.length) return null;
  return (
    <details className="assistant-threads">
      <summary>Threads ({children.length + posts.length})</summary>
      {children.length > 0 && <ThreadList label="Subthreads" threads={children} onOpen={onOpen} />}
      {posts.length > 0 && <ThreadList label="Post threads" threads={posts} onOpen={onOpen} />}
    </details>
  );
}
function ThreadList({ label, threads, onOpen }: { label: string; threads: Thread[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <h3>{label}</h3>
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            <button type="button" className="assistant-link" onClick={() => onOpen(thread.id)}>{thread.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STARTERS: Record<WritingKind, string[]> = {
  [KINDS.desk]: ["What should I write next?", "Which drafts are closest to done?", "What have I not written about in a while?"],
  [KINDS.post]: ["Interview me about this post", "Give me angles", "What's missing?"],
  [KINDS.idea]: ["Is this a post?", "Interview me about it"],
};

function ThreadChat({ view, withDraft, onReplied, onOpenThread }: {
  view: ThreadView;
  withDraft: boolean;
  onReplied: () => void;
  onOpenThread: (id: string) => void;
}) {
  const threadId = view.thread.id;
  const transport = useMemo(() => new DefaultChatTransport<UIMessage>({
    api: `${API}/${encodeURIComponent(threadId)}/chat`,
    // Only the new message goes up; the thread's history lives in D1.
    prepareSendMessagesRequest: ({ messages }) => ({
      body: { message: messages.at(-1), ...(withDraft ? { draft: readDraft() } : {}) },
    }),
  }), [threadId, withDraft]);
  const { messages, sendMessage, status, error, stop } = useChat({
    id: threadId,
    messages: view.messages,
    transport,
    onFinish: () => onReplied(),
  });
  const busy = status === "submitted" || status === "streaming";
  const [text, setText] = useState("");
  const [dictated, setDictated] = useState(false);
  const [dictationStatus, setDictationStatus] = useState("");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages]);

  const send = (value: string, kind: "brain-dump" | "reply" | "message" = "message") => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed, metadata: { kind } });
  };
  const submit = () => {
    send(text, dictated ? "brain-dump" : "message");
    setText("");
    setDictated(false);
  };
  const last = messages.at(-1);

  return (
    <div className="assistant-chat">
      <div className="assistant-log" ref={log}>
        {messages.length === 0 && (
          <div className="assistant-empty">
            <p>Tap <strong>Dictate</strong> and brain-dump what's on your mind. I'll reflect it back, ask questions and offer angles.</p>
            <div className="assistant-chips">
              {STARTERS[view.thread.kind].map((starter) => (
                <button key={starter} type="button" onClick={() => send(starter)} disabled={busy}>{starter}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            active={message === last && !busy}
            onReply={(reply) => send(reply, "reply")}
            onOpenThread={onOpenThread}
          />
        ))}
        {status === "submitted" && <p className="assistant-muted">Thinking…</p>}
        {error && <p className="assistant-error" role="alert">{error.message || "The reply failed. Try again."}</p>}
      </div>
      <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <textarea
          value={text}
          rows={3}
          placeholder="Brain-dump, answer, or ask…"
          aria-label="Message the assistant"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); submit(); }
          }}
        />
        <div className="assistant-actions">
          <DictateButton
            disabled={busy}
            onStart={() => setDictated(true)}
            onStatus={setDictationStatus}
            onText={(spoken) => setText((current) => (current.trim() ? `${current.trimEnd()} ${spoken.trim()}` : spoken.trim()))}
          />
          {busy
            ? <button type="button" onClick={() => void stop()}>Stop</button>
            : <button type="submit" className="assistant-send" disabled={!text.trim()}>Send</button>}
        </div>
        {dictationStatus && <p className="assistant-muted" role="status">{dictationStatus}</p>}
      </form>
    </div>
  );
}

type ToolPart = { type: string; state?: string; input?: unknown; output?: unknown };
const TOOL_NOTES: Record<string, string> = {
  listPosts: "Looked through your posts",
  readPost: "Read a post",
  listThreads: "Looked through your threads",
  readThread: "Read a thread",
};

function Message({ message, active, onReply, onOpenThread }: {
  message: UIMessage;
  active: boolean;
  onReply: (text: string) => void;
  onOpenThread: (id: string) => void;
}) {
  const kind = (message.metadata as { kind?: string } | undefined)?.kind;
  return (
    <div className={`assistant-message assistant-${message.role}`}>
      {message.role === "user" && kind === "brain-dump" && <p className="assistant-label">Brain dump</p>}
      {message.parts.map((part, index) => {
        if (part.type === "text") return <RichText key={index} text={part.text} />;
        if (!part.type.startsWith("tool-")) return null;
        const tool = part as ToolPart;
        const name = tool.type.slice(5);
        const input = (tool.input ?? {}) as Record<string, unknown>;
        if (name === "askQuestion" && typeof input.question === "string") {
          const replies = Array.isArray(input.replies) ? input.replies.map(String) : [];
          return (
            <div key={index} className="assistant-card assistant-question">
              <p className="assistant-question-text">{input.question}</p>
              {typeof input.why === "string" && <p className="assistant-muted">{input.why}</p>}
              {active && replies.length > 0 && (
                <div className="assistant-chips">
                  {replies.map((reply) => <button key={reply} type="button" onClick={() => onReply(reply)}>{reply}</button>)}
                </div>
              )}
            </div>
          );
        }
        if (name === "suggestIdeas" && Array.isArray(input.ideas)) {
          return (
            <div key={index} className="assistant-ideas">
              {(input.ideas as Record<string, unknown>[]).map((idea, ideaIndex) => (
                <IdeaCard key={ideaIndex} idea={idea} active={active} onExplore={onReply} />
              ))}
            </div>
          );
        }
        if (name === "startSubthread" && tool.state === "output-available") {
          const output = tool.output as { threadId?: string; title?: string } | undefined;
          return output?.threadId ? (
            <button key={index} type="button" className="assistant-card assistant-subthread" onClick={() => onOpenThread(output.threadId!)}>
              Subthread started: <strong>{output.title}</strong> ›
            </button>
          ) : null;
        }
        if (TOOL_NOTES[name]) return <p key={index} className="assistant-muted assistant-note">{TOOL_NOTES[name]}</p>;
        return null;
      })}
    </div>
  );
}

function IdeaCard({ idea, active, onExplore }: { idea: Record<string, unknown>; active: boolean; onExplore: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  const title = String(idea.title ?? "");
  const opening = String(idea.opening ?? "");
  if (!title) return null;
  return (
    <div className="assistant-card assistant-idea">
      <p className="assistant-idea-title">{title}</p>
      {idea.angle ? <p>{String(idea.angle)}</p> : null}
      {opening && <blockquote>{opening}</blockquote>}
      <div className="assistant-chips">
        {opening && (
          <button type="button" onClick={() => {
            void navigator.clipboard?.writeText(opening).then(() => setCopied(true), () => setCopied(false));
          }}>{copied ? "Copied" : "Copy opening"}</button>
        )}
        {active && <button type="button" onClick={() => onExplore(`Let's explore "${title}".`)}>Explore</button>}
      </div>
    </div>
  );
}

/** Paragraphs, "- " lists and **bold**. Model text is rendered as text, never as HTML. */
function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={blocks.length}>{list.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
    list = [];
  };
  for (const line of text.split("\n")) {
    const item = /^\s*(?:[-*•]|\d+\.)\s+(.*)$/.exec(line);
    if (item) { list.push(item[1]!); continue; }
    flush();
    if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <>{blocks}</>;
}
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((piece, index) =>
    piece.startsWith("**") && piece.endsWith("**") && piece.length > 4 ? <strong key={index}>{piece.slice(2, -2)}</strong> : piece);
}
