import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { DESK_THREAD_ID, threadStore } from "../src/assistant/store.ts";

/** The slice of D1 the store uses, over in-memory SQLite. */
function d1() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const statement = (sql, values = []) => ({
    bind: (...next) => statement(sql, next),
    first: async () => sqlite.prepare(sql).get(...values) ?? null,
    all: async () => ({ results: sqlite.prepare(sql).all(...values) }),
    run: async () => sqlite.prepare(sql).run(...values),
    exec: () => (/^\s*select/i.test(sql) ? sqlite.prepare(sql).all(...values) : sqlite.prepare(sql).run(...values)),
  });
  return {
    prepare: (sql) => statement(sql),
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((item) => item.exec());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
const text = (id, role, value) => ({ id, role, parts: [{ type: "text", text: value }] });

test("the desk is the parent of every post thread", async () => {
  const store = threadStore(d1());
  const post = await store.forPost("post-uuid-1", "Yubikeys");
  assert.equal(post.id, "post-post-uuid-1");
  assert.equal(post.parentId, DESK_THREAD_ID);
  assert.equal((await store.desk()).type, "writing.desk");
  assert.deepEqual((await store.children(DESK_THREAD_ID)).map((thread) => thread.id), [post.id]);
  // Opening again keeps one thread and follows the post's title.
  const renamed = await store.forPost("post-uuid-1", "Bootstrapping secrets");
  assert.equal(renamed.id, post.id);
  assert.equal((await store.get(post.id)).title, "Bootstrapping secrets");
  assert.equal((await store.all()).length, 2);
});

test("subthreads hang off any thread and keep its post", async () => {
  const store = threadStore(d1());
  const post = await store.forPost("p2", "Travel");
  const idea = await store.startSubthread(post.id, "Night trains", "He loved the sleeper from Vienna.");
  assert.equal(idea.parentId, post.id);
  assert.equal(idea.contextId, "p2");
  assert.equal(idea.type, "writing.idea");
  assert.equal(idea.brief, "He loved the sleeper from Vienna.");
  await assert.rejects(() => store.startSubthread("missing", "x", "y"));
});

test("messages are saved by id, replaced while a reply grows, and read in order", async () => {
  const store = threadStore(d1());
  const desk = await store.desk();
  await store.save(desk.id, [text("u1", "user", "brain dump about trains")]);
  await store.save(desk.id, [text("a1", "assistant", "What I heard")]);
  await store.save(desk.id, [text("a1", "assistant", "What I heard: trains, sleep")]);
  const messages = await store.messages(desk.id);
  assert.deepEqual(messages.map((message) => message.id), ["u1", "a1"]);
  assert.equal(messages[1].parts[0].text, "What I heard: trains, sleep");
  assert.equal(await store.transcript(desk.id), "Writer: brain dump about trains\n\nAssistant: What I heard: trains, sleep");
  assert.equal((await store.all())[0].entries, 2);
  // An id saved in one thread is never moved into another.
  const other = await store.forPost("p3", "Food");
  await store.save(other.id, [text("u1", "user", "hijack")]);
  assert.equal((await store.messages(desk.id))[0].parts[0].text, "brain dump about trains");
  assert.equal((await store.messages(other.id)).length, 0);
});
