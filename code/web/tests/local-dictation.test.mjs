import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalDictation } from "@quiescent/editor";
import { localDictation } from "../src/writing/local-dictation.ts";

const options = { langs: ["en-US"], processLocally: true };
function speechProvider(initial, installed = true) {
  let availability = initial;
  const calls = [];
  const recognition = {};
  return {
    calls,
    recognition,
    async available(input) {
      calls.push(["available", input]);
      return availability;
    },
    async install(input) {
      calls.push(["install", input]);
      if (installed) availability = "available";
      return installed;
    },
    create() {
      calls.push(["create"]);
      return recognition;
    },
  };
}

test("the editor installs on initialization without a click or microphone access", async () => {
  const native = speechProvider("downloadable");
  const button = new EventTarget();
  button.setAttribute = () => {};
  const controller = createLocalDictation({
    ...localDictation(() => {}, native),
    button,
    interim: { textContent: "" },
    insert: () => { assert.fail("Initialization must not insert text."); },
  });
  try {
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(button.textContent, "Dictate");
    assert.equal(button.disabled, false);
    assert.equal(native.calls.filter(([name]) => name === "install").length, 1);
    assert.equal(native.calls.filter(([name]) => name === "create").length, 0);
  } finally {
    controller.destroy();
  }
});

for (const state of ["downloadable", "downloading"]) {
  test(`prepares a ${state} language pack during the editor's initial check`, async () => {
    const native = speechProvider(state);
    const messages = [];
    const dictation = localDictation((message) => messages.push(message), native);
    assert.equal(dictation.lang, "en-US");
    assert.equal(await dictation.provider.available(options), "available");
    assert.deepEqual(native.calls, [
      ["available", options],
      ["install", { langs: ["en-US"] }],
      ["available", options],
    ]);
    assert.match(messages[0], /Downloading/);
    assert.equal(messages.at(-1), "");
    assert.equal(dictation.provider.create(), native.recognition);
  });
}

for (const state of ["available", "unavailable"]) {
  test(`does not install a pack that is ${state}`, async () => {
    const native = speechProvider(state);
    const messages = [];
    const { provider } = localDictation((message) => messages.push(message), native);
    assert.equal(await provider.available(options), state);
    assert.deepEqual(native.calls, [["available", options]]);
    if (state === "unavailable") assert.match(messages.at(-1), /unavailable/);
    else assert.deepEqual(messages, []);
  });
}

test("reports a failed download and retains the manual install retry", async () => {
  const native = speechProvider("downloadable", false);
  const messages = [];
  const { provider } = localDictation((message) => messages.push(message), native);
  assert.equal(await provider.available(options), "downloadable");
  assert.match(messages.at(-1), /not installed.*retry/);
  assert.equal(await provider.install({ langs: ["en-US"] }), false);
  assert.equal(native.calls.filter(([name]) => name === "install").length, 2);
});

test("reports errors checking or installing without swallowing them", async () => {
  for (const method of ["available", "install"]) {
    const native = speechProvider("downloadable");
    const failure = new Error(`${method} failed`);
    native[method] = async () => { throw failure; };
    const messages = [];
    const { provider } = localDictation((message) => messages.push(message), native);
    await assert.rejects(provider.available(options), failure);
    assert.match(messages.at(-1), /Could not prepare/);
  }
});

test("shares an in-flight download between editor checks", async () => {
  const native = speechProvider("downloadable");
  let finish;
  native.install = () => {
    native.calls.push(["install"]);
    return new Promise((resolve) => { finish = resolve; });
  };
  const { provider } = localDictation(() => {}, native);
  const first = provider.available(options);
  const second = provider.available(options);
  assert.equal(first, second);
  await Promise.resolve();
  finish(true);
  await first;
  assert.equal(native.calls.filter(([name]) => name === "install").length, 1);
});

test("leaves unsupported browsers on the editor's native unsupported path", () => {
  assert.deepEqual(localDictation(() => {}, undefined), { lang: "en-US" });
});
