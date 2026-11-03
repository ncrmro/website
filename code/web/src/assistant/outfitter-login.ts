/**
 * Signing the admin in to Outfitter's DGX inference, with no CLI.
 *
 * ai-outfitter.com issues inference tokens through the OAuth 2.0 device
 * authorization grant (RFC 8628) only. The Worker asks for a code, the writer
 * approves it in an ai-outfitter.com tab, and the Worker exchanges it for a
 * 15-minute access token (`oftr_at_…`) and a rotating refresh token that keeps
 * the login for 30 days. Both are kept in D1, encrypted with AUTH_SECRET.
 *
 * Outfitter ends the whole session if a refresh token is used twice, so
 * refreshes are serialized across isolates with a short lease in the row.
 */

export const OUTFITTER_CLIENT_ID = "outfitter-cli";
const SCOPE = "inference";
const DEVICE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";
/** Refresh when less than this is left, so a long turn never outlives its token. */
const REFRESH_MARGIN_MS = 3 * 60_000;
const LEASE_MS = 20_000;

export interface Account { name?: string; email?: string }
type Pending = {
  status: "pending";
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete: string;
  interval: number;
  nextPollAt: number;
  expiresAt: number;
};
type Connected = {
  status: "connected";
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
  account: Account;
  connectedAt: number;
};
type State = Pending | Connected;

/** What the browser may see: never a token or the device code. */
export type LoginStatus =
  | { state: "none"; error?: string }
  | { state: "pending"; userCode: string; verificationUri: string; verificationUriComplete: string; interval: number; expiresAt: number }
  | { state: "connected"; account: Account; connectedAt: number };

export interface LoginOptions {
  db: D1Database;
  /** AUTH_SECRET: the key the tokens are encrypted with. */
  secret: string;
  /** Outfitter's origin, e.g. https://ai-outfitter.com. */
  origin: string;
  clientId?: string;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

const SCHEMA = `CREATE TABLE IF NOT EXISTS outfitter_login (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  version INTEGER NOT NULL,
  lease_until INTEGER
)`;
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
  const clientId = options.clientId || OUTFITTER_CLIENT_ID;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const key = sealingKey(options.secret);
  const schema = () => {
    let pending = ready.get(db);
    if (!pending) ready.set(db, pending = db.prepare(SCHEMA).run());
    return pending;
  };

  type Row = { state: State | null; version: number };
  async function read(): Promise<Row | null> {
    await schema();
    const row = await db.prepare(`SELECT data, version FROM outfitter_login WHERE id = 1`)
      .first<{ data: string; version: number }>();
    if (!row) return null;
    const state = await open(await key, row.data).catch(() => null);
    // A changed AUTH_SECRET makes the old login unreadable: treat it as signed out.
    return { state: state as State | null, version: row.version };
  }
  /** Replaces the row only if nobody changed it since `version` was read; true when written. */
  async function write(state: State | null, version: number | null): Promise<boolean> {
    await schema();
    if (state === null) {
      const result = version === null
        ? await db.prepare(`DELETE FROM outfitter_login WHERE id = 1`).run()
        : await db.prepare(`DELETE FROM outfitter_login WHERE id = 1 AND version = ?`).bind(version).run();
      return version === null || result.meta.changes === 1;
    }
    const data = await seal(await key, state);
    if (version === null) {
      await db.prepare(`INSERT INTO outfitter_login (id, data, version, lease_until) VALUES (1, ?, 1, NULL)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, version = outfitter_login.version + 1, lease_until = NULL`).bind(data).run();
      return true;
    }
    const result = await db.prepare(`UPDATE outfitter_login SET data = ?, version = version + 1, lease_until = NULL WHERE id = 1 AND version = ?`)
      .bind(data, version).run();
    return result.meta.changes === 1;
  }

  async function post(path: string, form: Record<string, string>): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await fetch(new URL(path, origin), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ client_id: clientId, ...form }),
      redirect: "error",
    });
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    return { status: response.status, body };
  }
  async function account(accessToken: string): Promise<Account> {
    try {
      const response = await fetch(new URL("/api/oauth/userinfo", origin), { headers: { Authorization: `Bearer ${accessToken}` }, redirect: "error" });
      if (!response.ok) return {};
      const body = await response.json() as Record<string, unknown>;
      return { name: typeof body.name === "string" ? body.name : undefined, email: typeof body.email === "string" ? body.email : undefined };
    } catch {
      return {};
    }
  }
  const tokens = (body: Record<string, unknown>) => {
    const { access_token, refresh_token, expires_in } = body;
    if (typeof access_token !== "string" || typeof refresh_token !== "string")
      throw new OutfitterError("invalid_response", "Outfitter's token response had no tokens.");
    return { accessToken: access_token, refreshToken: refresh_token, accessExpiresAt: now() + (Number(expires_in) || 900) * 1000 };
  };

  const view = (state: State | null | undefined): LoginStatus => {
    if (!state) return { state: "none" };
    if (state.status === "connected") return { state: "connected", account: state.account, connectedAt: state.connectedAt };
    if (state.expiresAt <= now()) return { state: "none", error: "The sign-in code expired. Connect again." };
    const { userCode, verificationUri, verificationUriComplete, interval, expiresAt } = state;
    return { state: "pending", userCode, verificationUri, verificationUriComplete, interval, expiresAt };
  };

  return {
    async status(): Promise<LoginStatus> {
      return view((await read())?.state);
    },

    /** Asks Outfitter for a device code; the writer approves it at verificationUriComplete. */
    async start(): Promise<LoginStatus> {
      const { status, body } = await post("/api/oauth/device/code", { scope: SCOPE });
      const { device_code, user_code, verification_uri, verification_uri_complete } = body;
      if (status !== 200 || typeof device_code !== "string" || typeof user_code !== "string" || typeof verification_uri !== "string")
        throw new OutfitterError(String(body.error ?? "device_code_failed"), `Outfitter would not start a sign-in (${status}).`);
      const verify = new URL(typeof verification_uri_complete === "string" ? verification_uri_complete : verification_uri);
      // Only ever send the writer to Outfitter itself.
      if (verify.origin !== new URL(origin).origin) throw new OutfitterError("invalid_response", "Outfitter's sign-in link pointed elsewhere.");
      const interval = Math.max(5, Number(body.interval) || 5);
      const previous = await read();
      const state: Pending = {
        status: "pending",
        deviceCode: device_code,
        userCode: user_code,
        verificationUri: verification_uri,
        verificationUriComplete: verify.href,
        interval,
        nextPollAt: now() + interval * 1000,
        expiresAt: now() + (Number(body.expires_in) || 600) * 1000,
      };
      // Connecting again replaces the old login.
      if (previous?.state?.status === "connected") await revoke(previous.state.refreshToken);
      await write(state, null);
      return view(state);
    },

    /** Checks once whether the writer approved the code. The browser calls this every `interval` seconds. */
    async poll(): Promise<LoginStatus> {
      const row = await read();
      const state = row?.state;
      if (!row || !state || state.status !== "pending") return view(state);
      if (state.expiresAt <= now()) {
        await write(null, row.version);
        return view(state);
      }
      if (now() < state.nextPollAt) return view(state);
      const { status, body } = await post("/api/oauth/token", { grant_type: DEVICE_GRANT, device_code: state.deviceCode });
      if (status === 200) {
        const issued = tokens(body);
        const connected: Connected = { status: "connected", ...issued, account: await account(issued.accessToken), connectedAt: now() };
        if (await write(connected, row.version)) return view(connected);
        // Another tab finished first and our tokens are spare: end that session.
        await revoke(issued.refreshToken);
        return view((await read())?.state);
      }
      const error = String(body.error ?? "");
      if (error === "authorization_pending" || error === "slow_down") {
        const interval = state.interval + (error === "slow_down" ? 5 : 0);
        const next: Pending = { ...state, interval, nextPollAt: now() + interval * 1000 };
        await write(next, row.version);
        return view(next);
      }
      // access_denied, expired_token or invalid_grant: this code is finished.
      if (!(await write(null, row.version))) return view((await read())?.state);
      return { state: "none", error: error === "access_denied" ? "Sign-in was declined on Outfitter." : "The sign-in code expired. Connect again." };
    },

    /** Signs out on Outfitter (best effort) and forgets the tokens. */
    async disconnect(): Promise<LoginStatus> {
      const row = await read();
      if (row?.state?.status === "connected") await revoke(row.state.refreshToken);
      await write(null, null);
      return { state: "none" };
    },

    /**
     * A current access token for the inference relay, refreshing it when it is
     * close to expiry, or null when not signed in.
     */
    async accessToken(): Promise<string | null> {
      for (let attempt = 0; attempt < 40; attempt++) {
        const row = await read();
        const state = row?.state;
        if (!row || !state || state.status !== "connected") return null;
        if (state.accessExpiresAt - now() > REFRESH_MARGIN_MS) return state.accessToken;
        // Take the refresh lease, or wait for whoever holds it.
        const leased = await db.prepare(`UPDATE outfitter_login SET lease_until = ? WHERE id = 1 AND version = ? AND (lease_until IS NULL OR lease_until < ?)`)
          .bind(now() + LEASE_MS, row.version, now()).run();
        if (leased.meta.changes !== 1) {
          await sleep(250);
          continue;
        }
        // On a network error it is unknown whether Outfitter rotated the token, so the lease is left to expire.
        const result = await post("/api/oauth/token", { grant_type: "refresh_token", refresh_token: state.refreshToken });
        if (result.status === 200) {
          const issued = tokens(result.body);
          await write({ ...state, ...issued }, row.version);
          return issued.accessToken;
        }
        if (result.body.error === "invalid_grant") {
          // Revoked or expired on Outfitter: signed out.
          await write(null, row.version);
          return null;
        }
        await db.prepare(`UPDATE outfitter_login SET lease_until = NULL WHERE id = 1 AND version = ?`).bind(row.version).run();
        throw new OutfitterError(String(result.body.error ?? "refresh_failed"), `Outfitter would not refresh the login (${result.status}).`);
      }
      throw new OutfitterError("refresh_busy", "Outfitter's login is being refreshed. Try again.");
    },
  };

  async function revoke(token: string) {
    await post("/api/oauth/revoke", { token }).catch(() => undefined);
  }
}

// AES-GCM with a key derived from AUTH_SECRET, so D1 never holds a usable token.
async function sealingKey(secret: string): Promise<CryptoKey> {
  if (!secret) throw new OutfitterError("no_secret", "AUTH_SECRET is not set.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(), info: new TextEncoder().encode("ncrmro.com outfitter-login v1") },
    material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}
async function seal(key: CryptoKey, value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value))));
  return `${base64(iv)}.${base64(data)}`;
}
async function open(key: CryptoKey, sealed: string): Promise<unknown> {
  const [iv, data] = sealed.split(".").map(unbase64);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv! }, key, data!);
  return JSON.parse(new TextDecoder().decode(plain));
}
const base64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unbase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
