import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { d1 } from "./helpers/d1.mjs";
import { outfitterLogin } from "../src/assistant/outfitter-login.ts";
import { safeReturn, withOutcome } from "../src/assistant/outfitter-routes.ts";

const ORIGIN = "https://ai-outfitter.com";
const CALLBACK = "https://ncrmro.com/api/assistant/outfitter/callback";
const s256 = (value) => createHash("sha256").update(value).digest("base64url");

/** A fake Outfitter authorization server, per ai-outfitter/webapp docs/inference-oauth.md. */
function fakeOutfitter() {
  const calls = [];
  const codes = new Map();
  let clients = 0, issued = 0;
  const live = new Set();
  const reply = (body, status = 200) => Response.json(body, { status });
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    assert.equal(url.origin, ORIGIN);
    assert.equal(init.redirect, "error");
    assert.ok(!new Headers(init.headers).has("origin"));
    const type = new Headers(init.headers).get("content-type");
    const body = type === "application/json" ? JSON.parse(init.body) : Object.fromEntries(new URLSearchParams(String(init.body)));
    calls.push({ path: url.pathname, body });
    if (url.pathname === "/api/auth/oauth2/register") {
      assert.deepEqual(body, { client_name: "ncrmro.com", redirect_uris: [CALLBACK], token_endpoint_auth_method: "none" });
      return reply({ client_id: `client-${++clients}`, redirect_uris: body.redirect_uris }, 201);
    }
    if (url.pathname === "/api/auth/oauth2/token" && body.grant_type === "authorization_code") {
      const grant = codes.get(body.code);
      codes.delete(body.code);
      if (!grant || grant.clientId !== body.client_id || grant.redirectUri !== body.redirect_uri || s256(body.code_verifier) !== grant.challenge)
        return reply({ error: "invalid_grant" }, 400);
      return reply(tokens());
    }
    if (url.pathname === "/api/auth/oauth2/token" && body.grant_type === "refresh_token") {
      if (!live.has(body.refresh_token)) return reply({ error: "invalid_grant" }, 400);
      live.delete(body.refresh_token);
      return reply(tokens());
    }
    if (url.pathname === "/api/auth/oauth2/revoke") { live.delete(body.token); return new Response(null); }
    return reply({ error: "not_found" }, 404);
  };
  function tokens() {
    issued++;
    live.add(`rt-${issued}`);
    return { access_token: `jwt.${issued}.sig`, token_type: "Bearer", expires_in: 900, refresh_token: `rt-${issued}`, scope: "inference offline_access" };
  }
  /** The writer approves on the consent page: Outfitter redirects back with a code. */
  function approve(consentUrl) {
    const url = new URL(consentUrl);
    assert.equal(url.origin + url.pathname, `${ORIGIN}/api/auth/oauth2/authorize`);
    const params = Object.fromEntries(url.searchParams);
    assert.equal(params.response_type, "code");
    assert.equal(params.scope, "inference offline_access");
    assert.equal(params.code_challenge_method, "S256");
    assert.equal(params.redirect_uri, CALLBACK);
    const code = `code-${codes.size + 1}-${params.state.slice(0, 4)}`;
    codes.set(code, { clientId: params.client_id, redirectUri: params.redirect_uri, challenge: params.code_challenge });
    return new URLSearchParams({ code, state: params.state, iss: `${ORIGIN}/api/auth` });
  }
  const deny = (consentUrl) => new URLSearchParams({ error: "access_denied", state: new URL(consentUrl).searchParams.get("state"), iss: `${ORIGIN}/api/auth` });
  return { fetch, calls, approve, deny, live };
}

function setup(outfitter) {
  let clock = 1_000_000;
  const db = d1();
  const make = () => outfitterLogin({ db, secret: "test-secret", origin: ORIGIN, now: () => clock, sleep: async (ms) => { clock += ms; } });
  globalThis.fetch = outfitter.fetch;
  return { db, login: make(), make, tick: (ms) => { clock += ms; } };
}
async function withFetch(run) {
  const realFetch = globalThis.fetch;
  try { await run(); } finally { globalThis.fetch = realFetch; }
}

test("connect: register once, consent with PKCE, callback exchanges the code", () => withFetch(async () => {
  const outfitter = fakeOutfitter();
  const { db, login, tick } = setup(outfitter);
  assert.deepEqual(await login.status(), { state: "none" });
  assert.equal(await login.accessToken(), null);

  const consent = await login.authorize(CALLBACK, "/admin/posts/1");
  assert.equal(await login.callback(outfitter.approve(consent)), "/admin/posts/1");
  assert.deepEqual(await login.status(), { state: "connected", connectedAt: 1_000_000 });
  assert.equal(await login.accessToken(), "jwt.1.sig");

  // A callback replayed with the same state is refused.
  await assert.rejects(login.callback(outfitter.approve(consent)), /expired/);

  // Tokens are encrypted at rest; the state is stored hashed.
  const row = await db.prepare("SELECT data FROM outfitter_login").first();
  assert.ok(!row.data.includes("rt-1") && !row.data.includes("jwt."));

  // Connecting again reuses the registration and revokes the old session.
  await login.callback(outfitter.approve(await login.authorize(CALLBACK, "/admin")));
  assert.equal(outfitter.calls.filter((call) => call.path.endsWith("/register")).length, 1);
  assert.ok(!outfitter.live.has("rt-1"));

  // Near expiry it refreshes once and keeps the rotated token.
  tick(13 * 60_000);
  assert.equal(await login.accessToken(), "jwt.3.sig");
  assert.equal(await login.accessToken(), "jwt.3.sig");
  assert.deepEqual([...outfitter.live], ["rt-3"]);

  await login.disconnect();
  assert.equal(outfitter.live.size, 0, "disconnect revokes the session on Outfitter");
  assert.deepEqual(await login.status(), { state: "none" });
}));

test("declined, forged, wrong-issuer and expired callbacks sign nothing in", () => withFetch(async () => {
  const outfitter = fakeOutfitter();
  const { login, tick } = setup(outfitter);
  await assert.rejects(login.callback(outfitter.deny(await login.authorize(CALLBACK, "/admin"))), /declined/);
  await assert.rejects(login.callback(new URLSearchParams({ code: "x", state: "made-up" })), /expired/);
  const consent = await login.authorize(CALLBACK, "/admin");
  const wrongIssuer = outfitter.approve(consent);
  wrongIssuer.set("iss", "https://evil.example/api/auth");
  await assert.rejects(login.callback(wrongIssuer), /wrong issuer/);
  const late = await login.authorize(CALLBACK, "/admin");
  tick(11 * 60_000);
  await assert.rejects(login.callback(outfitter.approve(late)), /expired/);
  assert.deepEqual(await login.status(), { state: "none" });
}));

test("concurrent refreshes use the refresh token once", () => withFetch(async () => {
  const outfitter = fakeOutfitter();
  const { login, make, tick } = setup(outfitter);
  await login.callback(outfitter.approve(await login.authorize(CALLBACK, "/admin")));
  tick(13 * 60_000);
  const tokens = await Promise.all([make().accessToken(), make().accessToken(), make().accessToken()]);
  assert.deepEqual(tokens, ["jwt.2.sig", "jwt.2.sig", "jwt.2.sig"]);
  assert.equal(outfitter.calls.filter((call) => call.body.grant_type === "refresh_token").length, 1);
}));

test("a site disconnected on Outfitter reads as signed out after a 401", () => withFetch(async () => {
  const outfitter = fakeOutfitter();
  const { login } = setup(outfitter);
  await login.callback(outfitter.approve(await login.authorize(CALLBACK, "/admin")));
  outfitter.live.clear();
  // The relay answered 401: the next turn refreshes, which fails, so it is signed out.
  await login.expire();
  assert.equal(await login.accessToken(), null);
  assert.deepEqual(await login.status(), { state: "none" });
}));

test("the callback only returns to admin pages", () => {
  assert.equal(safeReturn("/admin/posts/1?x=1"), "/admin/posts/1?x=1");
  for (const bad of ["https://evil.example", "//evil.example", "/admin//evil", "/\\evil", "/posts", undefined]) assert.equal(safeReturn(bad), "/admin");
  assert.equal(withOutcome("/admin?tab=1", {}), "/admin?tab=1&outfitter=connected");
  assert.equal(withOutcome("/admin", { error: "Declined" }), "/admin?outfitter=error&outfitter_error=Declined");
});
