import { useEffect, useState } from "react";
import type { LoginStatus } from "../outfitter-login";

const API = "/api/assistant/outfitter";

/** The sign-in outcome Outfitter's callback left in the URL, removed once read. */
function takeOutcome(): string {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("outfitter")) return "";
  const error = url.searchParams.get("outfitter_error") ?? "";
  url.searchParams.delete("outfitter");
  url.searchParams.delete("outfitter_error");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  return error;
}

/**
 * Connect the assistant to Outfitter's DGX inference with Outfitter's redirect
 * login: the form posts to this site, which sends the writer to Outfitter's
 * consent page and back.
 */
export function OutfitterLogin() {
  const [status, setStatus] = useState<LoginStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setError(takeOutcome());
    fetch(API)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
        setStatus(await response.json() as LoginStatus);
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);
  const disconnect = () => {
    setBusy(true);
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "disconnect" }) })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.text()) || "Could not disconnect.");
        setStatus(await response.json() as LoginStatus);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false));
  };

  const alert = error && <p className="assistant-error" role="alert">{error}</p>;
  if (!status) return alert || null;
  if (status.state === "connected") {
    return (
      <div className="assistant-login">
        <p className="assistant-muted">Outfitter DGX connected</p>
        <button type="button" className="assistant-link" disabled={busy} onClick={disconnect}>Disconnect</button>
        {alert}
      </div>
    );
  }
  return (
    <form className="assistant-login" method="post" action={`${API}/connect`}>
      <input type="hidden" name="returnTo" value={window.location.pathname + window.location.search} />
      <button type="submit" className="assistant-button" disabled={busy}>Connect Outfitter</button>
      <p className="assistant-muted">Sign in to use Outfitter's DGX inference.</p>
      {alert}
    </form>
  );
}
