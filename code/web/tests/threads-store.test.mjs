import { test } from "node:test";
import assert from "node:assert/strict";
import { d1 } from "./helpers/d1.mjs";
import { threadStore } from "../src/threads/store.ts";
import { DESK_ID, KINDS, writingThreads } from "../src/assistant/threads.ts";

const text = (id, role, value) => ({ id, role, parts: [{ type: "text", text: value }] });

test("schema migrations run once and record their version", async () => {
  const db = d1();
  const store = threadStore(db);
  await store.list();
  await threadStore(db).list();
  assert.deepEqual((await db.prepare("SELECT version FROM thread_schema").all()).results.map((row) => row.version), [1]);
});

test("threads are generic: kind, parent, parent message, subject and metadata", async () => {
  const store = threadStore(d1());
  const root = await store.create({ id: "root", kind: "demo.root", title: "Root" });
  const child = await store.create({
    kind: "demo.child", title: "Child", parentId: root.id, parentMessageId: "msg-1",
    subjectType: "thing", subjectId: "42", metadata: { note: "hi" },
  });
  assert.equal(child.parentId, "root");
  assert.equal(child.parentMessageId, "msg-1");
  assert.deepEqual(child.metadata, { note: "hi" });
  assert.deepEqual((await store.list({ parentId: "root" })).map((thread) => thread.id), [child.id]);
  // Creating a known id again returns it unchanged.
  assert.equal((await store.create({ id: "root", kind: "other", title: "Changed" })).title, "Root");
});

test("messages are saved by id, replaced while a reply grows, and never move threads", async () => {
  const store = threadStore(d1());
  const a = await store.create({ kind: "demo", title: "A" });
  const b = await store.create({ kind: "demo", title: "B" });
  await store.save(a.id, [text("u1", "user", "brain dump about trains")]);
  await store.save(a.id, [text("a1", "assistant", "What I heard")]);
  await store.save(a.id, [text("a1", "assistant", "What I heard: trains, sleep")]);
  assert.deepEqual((await store.messages(a.id)).map((message) => message.id), ["u1", "a1"]);
  assert.deepEqual(await store.transcript(a.id), [
    { role: "user", text: "brain dump about trains" },
    { role: "assistant", text: "What I heard: trains, sleep" },
  ]);
  assert.equal((await store.list())[0].messageCount, 2);
  await store.save(b.id, [text("u1", "user", "hijack")]);
  assert.equal((await store.messages(a.id))[0].parts[0].text, "brain dump about trains");
  assert.equal((await store.messages(b.id)).length, 0);
});

test("writing threads: the desk is the parent of post threads, ideas hang off any thread", async () => {
  const store = threadStore(d1());
  const writing = writingThreads(store);
  const post = await writing.forPost("uuid-1", "Yubikeys");
  assert.equal(post.id, "post-uuid-1");
  assert.equal(post.parentId, DESK_ID);
  assert.equal((await store.get(DESK_ID)).kind, KINDS.desk);
  assert.equal((await writing.forPost("uuid-1", "Bootstrapping secrets")).title, "Bootstrapping secrets");
  assert.equal((await store.get(post.id)).title, "Bootstrapping secrets");
  const idea = await writing.startIdea(post, { title: "Night trains", brief: "The Vienna sleeper.", fromMessageId: "msg-9" });
  assert.equal(idea.kind, KINDS.idea);
  assert.equal(idea.parentId, post.id);
  assert.equal(idea.parentMessageId, "msg-9");
  assert.equal(idea.subjectId, "uuid-1");
  assert.deepEqual(idea.metadata, { brief: "The Vienna sleeper." });
});
