interface Env {
 SERVICE_TOKEN?: string;
 AUTH_SECRET?: string;
 AUTH_GOOGLE_ID?: string;
 AUTH_GOOGLE_SECRET?: string;
 /** Writing assistant model: Outfitter's DGX inference (personal oftr_inf_ token) when set. */
 OUTFITTER_INFERENCE_TOKEN?: string;
 /** Optional overrides: the relay URL (…/v1) and model id (default "flash"). */
 OUTFITTER_INFERENCE_URL?: string;
 OUTFITTER_INFERENCE_MODEL?: string;
 /** Fallback writing assistant model (Claude) when no Outfitter token is set. */
 ANTHROPIC_API_KEY?: string;
}

declare namespace Cloudflare { interface Env extends globalThis.Env {} }
