import { test } from "node:test";
import assert from "node:assert/strict";
import { d1 } from "./helpers/d1.mjs";
import { inferenceInput } from "./helpers/outfitter-relay-schema.mjs";
import { assistantModel, OUTFITTER_INFERENCE_URL } from "../src/assistant/model.ts";
import { assistantTools } from "../src/assistant/tools.ts";
import { writingThreads } from "../src/assistant/threads.ts";
import { threadStore } from "../src/threads/store.ts";
import { streamThreadReply } from "../src/threads/reply.ts";

const TOKEN = `oftr_inf_${"a".repeat(64)}`;
const sse = (chunks) => new Response(
  [...chunks.map((chunk) => `data: ${JSON.stringify({ id: "c", object: "chat.completion.chunk", created: 0, model: "flash", ...chunk })}\n\n`), "data: [DONE]\n\n"].join(""),
  { headers: { "Content-Type": "text/event-stream" } },
);
const call = (id, name, args) => ({ choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, id, type: "function", function: { name, arguments: JSON.stringify(args) } }] }, finish_reason: null }] });
const done = (reason) => ({ choices: [{ index: 0, delta: {}, finish_reason: reason }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } });
const say = (text) => ({ choices: [{ index: 0, delta: { role: "assistant", content: text }, finish_reason: null }] });

test("assistantModel prefers Outfitter, falls back to Claude, else none", () => {
  assert.equal(assistantModel({ OUTFITTER_INFERENCE_TOKEN: TOKEN, ANTHROPIC_API_KEY: "k" }).label, "Outfitter flash");
  assert.equal(assistantModel({ ANTHROPIC_API_KEY: "k" }).label, "Claude");
  assert.equal(assistantModel({}), null);
  assert.throws(() => assistantModel({ OUTFITTER_INFERENCE_TOKEN: TOKEN, OUTFITTER_INFERENCE_URL: "http://spark.local/v1" }));
});

test("a brain-dump turn on Outfitter's relay: every request passes the relay's schema, tools run, the reply is saved", async () => {
  const requests = [];
  const replies = [
    // Step 1: look at his posts. Step 2: reflect and ask one question (which ends the turn).
    sse([call("call_1", "listPosts", {}), done("tool_calls")]),
    sse([say("What I heard:\n- night trains\n- Vienna"), call("call_2", "askQuestion", { question: "What woke you up at 3am?", replies: ["The border", "The cold"] }), done("tool_calls")]),
  ];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    const headers = new Headers(init?.headers);
    requests.push({ url, auth: headers.get("authorization"), redirect: init?.redirect, body: JSON.parse(init.body) });
    return replies.shift() ?? new Response("unexpected", { status: 500 });
  };
  try {
    const store = threadStore(d1());
    const writing = writingThreads(store);
    const thread = await writing.forPost("post-1", "Night trains");
    const posts = async () => [{
      document: { id: "post-1", createdAt: "2026-01-01", frontmatter: { title: "Night trains", tags: ["travel"], description: "" }, body: "Draft." },
      branch: "draft/post-1", headSha: "x", state: "draft",
    }];
    const model = assistantModel({ OUTFITTER_INFERENCE_TOKEN: TOKEN });
    const response = await streamThreadReply({
      store, thread,
      message: { id: "u1", role: "user", parts: [{ type: "text", text: "um so the sleeper from vienna" }], metadata: { kind: "brain-dump" } },
      model: model.model,
      instructions: [{ role: "system", content: "Be a writing partner." }, { role: "system", content: "<draft>Draft.</draft>" }],
      tools: ({ replyId }) => assistantTools(thread, store, posts, replyId),
      stopWhen: [(await import("ai")).hasToolCall("askQuestion")],
      providerOptions: model.providerOptions,
    });
    assert.equal(response.status, 200);
    await response.text();
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.equal(requests.length, 2);
    for (const request of requests) {
      assert.equal(request.url, `${OUTFITTER_INFERENCE_URL}/chat/completions`);
      assert.equal(request.auth, `Bearer ${TOKEN}`);
      assert.equal(request.redirect, "error");
      assert.equal(request.body.model, "flash");
      assert.equal(request.body.reasoning_effort, "low");
      const parsed = inferenceInput.safeParse(request.body);
      assert.ok(parsed.success, JSON.stringify(parsed.error?.issues));
    }
    // The second step carries the tool call and its result back to the relay.
    const roles = requests[1].body.messages.map((message) => message.role);
    assert.deepEqual(roles, ["system", "system", "user", "assistant", "tool"]);

    const saved = await store.messages(thread.id);
    assert.deepEqual(saved.map((message) => message.role), ["user", "assistant"]);
    const parts = saved[1].parts.map((part) => part.type);
    assert.ok(parts.includes("tool-listPosts"));
    assert.ok(parts.includes("tool-askQuestion"));
    assert.ok(saved[1].parts.some((part) => part.type === "text" && part.text.includes("night trains")));
  } finally {
    globalThis.fetch = realFetch;
  }
});
