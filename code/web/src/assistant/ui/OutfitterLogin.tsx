import { useEffect, useState } from "react";
import type { LoginStatus } from "../outfitter-login";

const API = "/api/assistant/outfitter";
async function call(action?: "connect" | "poll" | "disconnect"): Promise<LoginStatus> {
  const response = await fetch(API, action
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }
    : undefined);
  if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
  return response.json() as Promise<LoginStatus>;
}

/**
 * Connect the assistant to Outfitter's DGX inference: the writer approves a
 * code on ai-outfitter.com and this polls until the Worker holds the login.
 */
export function OutfitterLogin() {
  const [status, setStatus] = useState<LoginStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = (action?: "connect" | "poll" | "disconnect") => {
    setBusy(true);
    return call(action)
      .then((next) => { setStatus(next); setError(next.state === "none" ? next.error ?? "" : ""); })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false));
  };
  useEffect(() => { void run(); }, []);

  // While a code waits for approval, check back at Outfitter's interval.
  const pending = status?.state === "pending" ? status : null;
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => void call("poll").then(
      (next) => { setStatus(next); if (next.state === "none") setError(next.error ?? ""); },
      () => setStatus({ ...pending }),
    ), pending.interval * 1000);
    return () => clearTimeout(timer);
  }, [pending]);

  if (!status) return error ? <p className="assistant-error" role="alert">{error}</p> : null;
  const alert = error && <p className="assistant-error" role="alert">{error}</p>;
  if (status.state === "connected") {
    const who = status.account.name || status.account.email;
    return (
      <div className="assistant-login">
        <p className="assistant-muted">Outfitter DGX{who ? ` · ${who}` : ""}</p>
        <button type="button" className="assistant-link" disabled={busy} onClick={() => void run("disconnect")}>Disconnect</button>
        {alert}
      </div>
    );
  }
  if (pending) {
    return (
      <div className="assistant-login assistant-login-pending" role="status">
        <p>Approve code <strong className="assistant-code">{pending.userCode}</strong> on Outfitter.</p>
        <div className="assistant-chips">
          <a className="assistant-button" href={pending.verificationUriComplete} target="_blank" rel="noopener noreferrer">Open ai-outfitter.com</a>
          <button type="button" disabled={busy} onClick={() => void run("disconnect")}>Cancel</button>
        </div>
        <p className="assistant-muted">Waiting for approval…</p>
        {alert}
      </div>
    );
  }
  return (
    <div className="assistant-login">
      <button type="button" className="assistant-button" disabled={busy} onClick={() => void run("connect")}>Connect Outfitter</button>
      <p className="assistant-muted">Sign in to use Outfitter's DGX inference.</p>
      {alert}
    </div>
  );
}
