interface Env {
 SERVICE_TOKEN?: string;
 AUTH_SECRET?: string;
 AUTH_GOOGLE_ID?: string;
 AUTH_GOOGLE_SECRET?: string;
 /** Optional: a personal oftr_inf_ token, used when the admin has not connected Outfitter from the sidebar. */
 OUTFITTER_INFERENCE_TOKEN?: string;
 /** Optional overrides: the relay URL (…/v1), model id (default "flash") and OAuth client id (default "outfitter-cli"). */
 OUTFITTER_INFERENCE_URL?: string;
 OUTFITTER_INFERENCE_MODEL?: string;
 OUTFITTER_CLIENT_ID?: string;
 /** Fallback writing assistant model (Claude) when no Outfitter token is set. */
 ANTHROPIC_API_KEY?: string;
}

declare namespace Cloudflare { interface Env extends globalThis.Env {} }
