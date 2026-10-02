interface Env {
 SERVICE_TOKEN?: string;
 AUTH_SECRET?: string;
 AUTH_GOOGLE_ID?: string;
 AUTH_GOOGLE_SECRET?: string;
}

declare namespace Cloudflare { interface Env extends globalThis.Env {} }
