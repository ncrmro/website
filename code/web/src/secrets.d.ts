interface Env {
 SERVICE_TOKEN?: string;
 AUTH_SECRET?: string;
 AUTH_GOOGLE_ID?: string;
 AUTH_GOOGLE_SECRET?: string;
 /** Writing assistant (Claude). Without it the assistant answers 503. */
 ANTHROPIC_API_KEY?: string;
}

declare namespace Cloudflare { interface Env extends globalThis.Env {} }
