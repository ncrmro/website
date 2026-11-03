/**
 * Signing the admin in to Outfitter's DGX inference with the standard OAuth 2.1
 * authorization code flow with PKCE (ai-outfitter/webapp docs/inference-oauth.md).
 *
 * The site registers itself with Outfitter once (RFC 7591, a public client),
 * sends the writer to Outfitter's consent page asking for the `inference`
 * scope, and on the callback exchanges the code for a 15-minute access token
 * bound to the inference relay and a rotating refresh token. The tokens are
 * kept in D1, encrypted with AUTH_SECRET, and never reach the browser.
 *
 * Refresh tokens rotate, so refreshes are serialized across isolates with a
 * short lease on the row.
 */

export const SCOPE = "inference offline_access";
/** Refresh when less than this is left, so a long turn never outlives its token. */
const REFRESH_MARGIN_MS = 3 * 60_000;
const LEASE_MS = 20_000;
/** How long the writer has to approve on Outfitter. */
const AUTHORIZATION_MS = 10 * 60_000;

type Connected = {
  clientId: string;
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
  connectedAt: number;
};
type Authorization = { clientId: string; redirectUri: string; verifier: string; returnTo: string };

/** What the browser may see: never a token. */
export type LoginStatus = { state: "none" } | { state: "connected"; connectedAt: number };

export interface LoginOptions {
  db: D1Database;
  /** AUTH_SECRET: the key the tokens are encrypted with. */
  secret: string;
  /** Outfitter's origin, e.g. https://ai-outfitter.com. */
  origin: string;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

const SCHEMA = [
  // One registration per callback URL; client ids are public.
  `CREATE TABLE IF NOT EXISTS outfitter_clients (redirect_uri TEXT PRIMARY KEY, client_id TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  // Sign-ins waiting for the callback, by their `state`.
  `CREATE TABLE IF NOT EXISTS outfitter_authorizations (state TEXT PRIMARY KEY, data TEXT NOT NULL, expires_at INTEGER NOT NULL)`,
  // The one login.
  `CREATE TABLE IF NOT EXISTS outfitter_login (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, version INTEGER NOT NULL, lease_until INTEGER)`,
];
const ready = new WeakMap<D1Database, Promise<unknown>>();

export class OutfitterError extends Error {
  readonly code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export function outfitterLogin(options: LoginOptions) {
  const { db, origin } = options;
  const issuer = `${origin}/api/auth`;
  const endpoint = (name: string) => `${issuer}/oauth2/${name}`;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const key = sealingKey(options.secret);
  const schema = () => {
    let pending = ready.get(db);
    if (!pending) ready.set(db, pending = db.batch(SCHEMA.map((statement) => db.prepare(statement))));
    return pending;
  };

  async function read(): Promise<{ login: Connected | null; version: number } | null> {
    await schema();
    const row = await db.prepare(`SELECT data, version FROM outfitter_login WHERE id = 1`).first<{ data: string; version: number }>();
    if (!row) return null;
    // A changed AUTH_SECRET makes the old login unreadable: treat it as signed out.
    const login = await open(await key, row.data).catch(() => null) as Connected | null;
    return { login, version: row.version };
  }
  /** Replaces the login; with `version`, only if nobody changed it since. True when written. */
  async function write(login: Connected | null, version?: number): Promise<boolean> {
    await schema();
    if (!login) {
      const result = version === undefined
        ? await db.prepare(`DELETE FROM outfitter_login WHERE id = 1`).run()
        : await db.prepare(`DELETE FROM outfitter_login WHERE id = 1 AND version = ?`).bind(version).run();
      return version === undefined || result.meta.changes === 1;
    }
    const data = await seal(await key, login);
    if (version === undefined) {
      await db.prepare(`INSERT INTO outfitter_login (id, data, version, lease_until) VALUES (1, ?, 1, NULL)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, version = outfitter_login.version + 1, lease_until = NULL`).bind(data).run();
      return true;
    }
    const result = await db.prepare(`UPDATE outfitter_login SET data = ?, version = version + 1, lease_until = NULL WHERE id = 1 AND version = ?`)
      .bind(data, version).run();
    return result.meta.changes === 1;
  }

  async function send(url: string, body: BodyInit, type: string) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": type, Accept: "application/json" },
      body,
      redirect: "error",
    });
    const json = await response.json().catch(() => ({})) as Record<string, unknown>;
    return { status: response.status, body: json };
  }
  const form = (name: string, fields: Record<string, string>) =>
    send(endpoint(name), new URLSearchParams(fields), "application/x-www-form-urlencoded");
  const tokens = (body: Record<string, unknown>) => {
    const { access_token, refresh_token, expires_in } = body;
    if (typeof access_token !== "string" || typeof refresh_token !== "string")
      throw new OutfitterError("invalid_response", "Outfitter's token response had no tokens.");
    return { accessToken: access_token, refreshToken: refresh_token, accessExpiresAt: now() + (Number(expires_in) || 900) * 1000 };
  };

  /** This site's client id for `redirectUri`, registering it with Outfitter the first time. */
  async function client(redirectUri: string): Promise<string> {
    await schema();
    const known = await db.prepare(`SELECT client_id FROM outfitter_clients WHERE redirect_uri = ?`).bind(redirectUri).first<{ client_id: string }>();
    if (known) return known.client_id;
    const { status, body } = await send(endpoint("register"), JSON.stringify({
      client_name: new URL(redirectUri).hostname,
      redirect_uris: [redirectUri],
      token_endpoint_auth_method: "none",
    }), "application/json");
    if (status >= 300 || typeof body.client_id !== "string")
      throw new OutfitterError(String(body.error ?? "register_failed"), `Outfitter would not register this site (${status}).`);
    await db.prepare(`INSERT OR IGNORE INTO outfitter_clients (redirect_uri, client_id, created_at) VALUES (?, ?, ?)`)
      .bind(redirectUri, body.client_id, now()).run();
    return (await db.prepare(`SELECT client_id FROM outfitter_clients WHERE redirect_uri = ?`).bind(redirectUri).first<{ client_id: string }>())!.client_id;
  }

  async function revoke(login: Connected) {
    await form("revoke", { token: login.refreshToken, token_type_hint: "refresh_token", client_id: login.clientId }).catch(() => undefined);
  }

  return {
    async status(): Promise<LoginStatus> {
      const login = (await read())?.login;
      return login ? { state: "connected", connectedAt: login.connectedAt } : { state: "none" };
    },

    /**
     * Starts a sign-in: returns Outfitter's consent URL to send the writer to.
     * `redirectUri` is this site's callback; `returnTo` is where the writer lands after.
     */
    async authorize(redirectUri: string, returnTo: string): Promise<string> {
      const clientId = await client(redirectUri);
      const state = randomToken();
      const verifier = randomToken();
      const authorization: Authorization = { clientId, redirectUri, verifier, returnTo };
      await db.prepare(`DELETE FROM outfitter_authorizations WHERE expires_at < ?`).bind(now()).run();
      await db.prepare(`INSERT INTO outfitter_authorizations (state, data, expires_at) VALUES (?, ?, ?)`)
        .bind(await digest(state), await seal(await key, authorization), now() + AUTHORIZATION_MS).run();
      const url = new URL(endpoint("authorize"));
      url.search = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: SCOPE,
        state,
        code_challenge: await challenge(verifier),
        code_challenge_method: "S256",
      }).toString();
      return url.href;
    },

    /**
     * Finishes a sign-in from the callback's query. Returns where to send the
     * writer, or throws an OutfitterError (`access_denied` when declined).
     */
    async callback(query: URLSearchParams): Promise<string> {
      const state = query.get("state");
      if (!state) throw new OutfitterError("invalid_request", "The sign-in is missing its state.");
      await schema();
      // Each state works once.
      const row = await db.prepare(`DELETE FROM outfitter_authorizations WHERE state = ? RETURNING data, expires_at`)
        .bind(await digest(state)).first<{ data: string; expires_at: number }>();
      if (!row || row.expires_at < now()) throw new OutfitterError("invalid_request", "This sign-in expired. Connect again.");
      const authorization = await open(await key, row.data) as Authorization;
      const error = query.get("error");
      if (error) throw new OutfitterError(error, error === "access_denied" ? "Sign-in was declined on Outfitter." : `Outfitter refused the sign-in (${error}).`);
      const iss = query.get("iss");
      if (iss && iss !== issuer) throw new OutfitterError("invalid_request", "The sign-in came back from the wrong issuer.");
      const code = query.get("code");
      if (!code) throw new OutfitterError("invalid_request", "The sign-in came back without a code.");
      const { status, body } = await form("token", {
        grant_type: "authorization_code",
        code,
        redirect_uri: authorization.redirectUri,
        client_id: authorization.clientId,
        code_verifier: authorization.verifier,
      });
      if (status !== 200) {
        // A registration Outfitter no longer knows is dropped, so the next Connect registers again.
        if (body.error === "invalid_client")
          await db.prepare(`DELETE FROM outfitter_clients WHERE redirect_uri = ?`).bind(authorization.redirectUri).run();
        throw new OutfitterError(String(body.error ?? "token_failed"), `Outfitter would not finish the sign-in (${status}).`);
      }
      const previous = (await read())?.login;
      await write({ clientId: authorization.clientId, ...tokens(body), connectedAt: now() });
      if (previous) await revoke(previous);
      return authorization.returnTo;
    },

    /** Signs out on Outfitter (best effort) and forgets the tokens. */
    async disconnect(): Promise<LoginStatus> {
      const login = (await read())?.login;
      if (login) await revoke(login);
      await write(null);
      return { state: "none" };
    },

    /** Forces the next accessToken() to refresh, e.g. after the relay answered 401. */
    async expire(): Promise<void> {
      const row = await read();
      if (row?.login) await write({ ...row.login, accessExpiresAt: 0 }, row.version);
    },

    /**
     * A current access token for the inference relay, refreshing it when it is
     * close to expiry, or null when not signed in.
     */
    async accessToken(): Promise<string | null> {
      for (let attempt = 0; attempt < 40; attempt++) {
        const row = await read();
        const login = row?.login;
        if (!row || !login) return null;
        if (login.accessExpiresAt - now() > REFRESH_MARGIN_MS) return login.accessToken;
        // Take the refresh lease, or wait for whoever holds it.
        const leased = await db.prepare(`UPDATE outfitter_login SET lease_until = ? WHERE id = 1 AND version = ? AND (lease_until IS NULL OR lease_until < ?)`)
          .bind(now() + LEASE_MS, row.version, now()).run();
        if (leased.meta.changes !== 1) {
          await sleep(250);
          continue;
        }
        // On a network error it is unknown whether Outfitter rotated the token, so the lease is left to expire.
        const { status, body } = await form("token", { grant_type: "refresh_token", refresh_token: login.refreshToken, client_id: login.clientId });
        if (status === 200) {
          const issued = tokens(body);
          await write({ ...login, ...issued }, row.version);
          return issued.accessToken;
        }
        if (status === 400 || status === 401) {
          // The writer disconnected the site on Outfitter, or the session ended.
          await write(null, row.version);
          return null;
        }
        await db.prepare(`UPDATE outfitter_login SET lease_until = NULL WHERE id = 1 AND version = ?`).bind(row.version).run();
        throw new OutfitterError(String(body.error ?? "refresh_failed"), `Outfitter would not refresh the login (${status}).`);
      }
      throw new OutfitterError("refresh_busy", "Outfitter's login is being refreshed. Try again.");
    },
  };
}

const encoder = new TextEncoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const randomToken = () => base64url(crypto.getRandomValues(new Uint8Array(32)));
/** RFC 7636 S256. */
const challenge = async (verifier: string) => base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))));
/** States are stored hashed, so the table cannot be replayed into a callback. */
const digest = challenge;

// AES-GCM with a key derived from AUTH_SECRET, so D1 never holds a usable token.
async function sealingKey(secret: string): Promise<CryptoKey> {
  if (!secret) throw new OutfitterError("no_secret", "AUTH_SECRET is not set.");
  const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(), info: encoder.encode("ncrmro.com outfitter-login v1") },
    material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}
async function seal(key: CryptoKey, value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(value))));
  return `${base64url(iv)}.${base64url(data)}`;
}
async function open(key: CryptoKey, sealed: string): Promise<unknown> {
  const [iv, data] = sealed.split(".").map(unbase64url);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv! }, key, data!);
  return JSON.parse(new TextDecoder().decode(plain));
}
function unbase64url(text: string): Uint8Array<ArrayBuffer> {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}
