import { test } from "node:test";
import assert from "node:assert/strict";
import { d1 } from "./helpers/d1.mjs";
import { outfitterLogin } from "../src/assistant/outfitter-login.ts";

const ORIGIN = "https://ai-outfitter.com";
const at = (n) => `oftr_at_${String(n).repeat(64).slice(0, 64)}`;
const rt = (n) => `oftr_rt_${String(n).repeat(64).slice(0, 64)}`;

/** A fake ai-outfitter.com OAuth server: device codes, polling, rotation, revocation. */
function fakeOutfitter() {
  const calls = [];
  let approved = false, denied = false, issued = 0, refresh = null;
  const reply = (body, status = 200) => Response.json(body, { status });
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    assert.equal(url.origin, ORIGIN);
    assert.equal(init.redirect, "error");
    const form = init.body ? Object.fromEntries(new URLSearchParams(String(init.body))) : {};
    calls.push({ path: url.pathname, form });
    if (url.pathname === "/api/oauth/userinfo") return reply({ sub: "u1", name: "Nicholas", email: "n@example.com" });
    assert.equal(form.client_id, "outfitter-cli");
    if (url.pathname === "/api/oauth/device/code") {
      assert.equal(form.scope, "inference");
      return reply({ device_code: "oftr_dc_x", user_code: "BCDF-GHJK", verification_uri: `${ORIGIN}/device`, verification_uri_complete: `${ORIGIN}/device?user_code=BCDF-GHJK`, expires_in: 600, interval: 5 });
    }
    if (url.pathname === "/api/oauth/token" && form.grant_type.endsWith("device_code")) {
      if (denied) return reply({ error: "access_denied" }, 400);
      if (!approved) return reply({ error: "authorization_pending" }, 400);
      if (refresh) return reply({ error: "invalid_grant" }, 400);
      issued++; refresh = rt(issued);
      return reply({ access_token: at(issued), token_type: "Bearer", expires_in: 900, refresh_token: refresh });
    }
    if (url.pathname === "/api/oauth/token" && form.grant_type === "refresh_token") {
      if (form.refresh_token !== refresh) { refresh = null; return reply({ error: "invalid_grant" }, 400); }
      issued++; refresh = rt(issued);
      return reply({ access_token: at(issued), token_type: "Bearer", expires_in: 900, refresh_token: refresh });
    }
    if (url.pathname === "/api/oauth/revoke") { if (form.token === refresh) refresh = null; return new Response(null); }
    return reply({ error: "not_found" }, 404);
  };
  return { fetch, calls, approve: () => { approved = true; }, deny: () => { denied = true; }, get refresh() { return refresh; } };
}

function setup(outfitter) {
  let clock = 1_000_000;
  const db = d1();
  const make = () => outfitterLogin({ db, secret: "test-secret", origin: ORIGIN, now: () => clock, sleep: async (ms) => { clock += ms; } });
  globalThis.fetch = outfitter.fetch;
  return { db, login: make(), make, tick: (ms) => { clock += ms; } };
}

test("connect: device code, wait for approval, then the Worker holds the login", async () => {
  const realFetch = globalThis.fetch;
  try {
    const outfitter = fakeOutfitter();
    const { db, login, tick } = setup(outfitter);
    assert.deepEqual(await login.status(), { state: "none" });
    assert.equal(await login.accessToken(), null);

    const pending = await login.start();
    assert.equal(pending.state, "pending");
    assert.equal(pending.userCode, "BCDF-GHJK");
    assert.equal(pending.verificationUriComplete, `${ORIGIN}/device?user_code=BCDF-GHJK`);
    assert.ok(!JSON.stringify(pending).includes("oftr_dc_"), "the device code never reaches the browser");

    // Polling early does not call Outfitter (RFC 8628 interval).
    await login.poll();
    assert.equal(outfitter.calls.filter((call) => call.path === "/api/oauth/token").length, 0);
    tick(5000);
    assert.equal((await login.poll()).state, "pending");

    outfitter.approve();
    tick(5000);
    const connected = await login.poll();
    assert.deepEqual(connected, { state: "connected", account: { name: "Nicholas", email: "n@example.com" }, connectedAt: 1_010_000 });
    assert.equal(await login.accessToken(), at(1));

    // Tokens are encrypted at rest.
    const row = await db.prepare("SELECT data FROM outfitter_login").first();
    assert.ok(!row.data.includes("oftr_"));

    // Near expiry it refreshes once, and the rotated token is kept.
    tick(13 * 60_000);
    assert.equal(await login.accessToken(), at(2));
    assert.equal(await login.accessToken(), at(2));
    assert.equal(outfitter.refresh, rt(2));

    await login.disconnect();
    assert.equal(outfitter.refresh, null, "disconnect revokes the session on Outfitter");
    assert.deepEqual(await login.status(), { state: "none" });
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a declined code signs nothing in", async () => {
  const realFetch = globalThis.fetch;
  try {
    const outfitter = fakeOutfitter();
    const { login, tick } = setup(outfitter);
    await login.start();
    outfitter.deny();
    tick(5000);
    assert.deepEqual(await login.poll(), { state: "none", error: "Sign-in was declined on Outfitter." });
    assert.equal(await login.accessToken(), null);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("concurrent refreshes use the refresh token once", async () => {
  const realFetch = globalThis.fetch;
  try {
    const outfitter = fakeOutfitter();
    const { login, make, tick } = setup(outfitter);
    await login.start();
    outfitter.approve();
    tick(5000);
    await login.poll();
    tick(13 * 60_000);
    // Two isolates at once: one refreshes, the other waits for its result.
    const tokens = await Promise.all([make().accessToken(), make().accessToken(), make().accessToken()]);
    assert.deepEqual(tokens, [at(2), at(2), at(2)]);
    assert.equal(outfitter.calls.filter((call) => call.form.grant_type === "refresh_token").length, 1);
    assert.equal(outfitter.refresh, rt(2), "the Outfitter session survived");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a login revoked on Outfitter reads as signed out", async () => {
  const realFetch = globalThis.fetch;
  try {
    const outfitter = fakeOutfitter();
    const { login, tick } = setup(outfitter);
    await login.start();
    outfitter.approve();
    tick(5000);
    await login.poll();
    await outfitter.fetch(`${ORIGIN}/api/oauth/revoke`, { method: "POST", redirect: "error", body: new URLSearchParams({ client_id: "outfitter-cli", token: outfitter.refresh }) });
    tick(13 * 60_000);
    assert.equal(await login.accessToken(), null);
    assert.deepEqual(await login.status(), { state: "none" });
  } finally {
    globalThis.fetch = realFetch;
  }
});
