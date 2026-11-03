import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel, SystemModelMessage } from "ai";

/** The Worker settings the assistant's model reads. */
export interface ModelEnv {
  OUTFITTER_INFERENCE_TOKEN?: string;
  OUTFITTER_INFERENCE_URL?: string;
  OUTFITTER_INFERENCE_MODEL?: string;
  OUTFITTER_CLIENT_ID?: string;
  ANTHROPIC_API_KEY?: string;
}

/**
 * Outfitter's OpenAI-compatible relay (`/api/inference/v1`). The `flash` model
 * is GLM on Outfitter's DGX Spark. The token is the admin's Outfitter login
 * (`oftr_at_…`, see outfitter-login.ts) or a personal inference token
 * (`oftr_inf_…`) set as OUTFITTER_INFERENCE_TOKEN.
 */
export const OUTFITTER_INFERENCE_URL = "https://ai-outfitter.com/api/inference/v1";
export const OUTFITTER_MODEL = "flash";
export const CLAUDE_MODEL = "claude-opus-5-5";

export interface AssistantModel {
  label: string;
  model: LanguageModel;
  providerOptions: NonNullable<SystemModelMessage["providerOptions"]>;
  /** Provider options that mark the stable instructions as cacheable, where supported. */
  cache: SystemModelMessage["providerOptions"];
}

function outfitterUrl(value: string | undefined): string {
  const url = new URL(value || OUTFITTER_INFERENCE_URL);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !url.pathname.endsWith("/v1"))
    throw new Error("OUTFITTER_INFERENCE_URL must be an https URL ending in /v1");
  return url.href.replace(/\/$/, "");
}

/** Where Outfitter's sign-in lives: the inference relay's origin. */
export function outfitterOrigin(env: ModelEnv): string {
  return new URL(outfitterUrl(env.OUTFITTER_INFERENCE_URL)).origin;
}

/**
 * Outfitter's DGX inference with the admin's Outfitter login, else with
 * OUTFITTER_INFERENCE_TOKEN, else Claude, else none. Requests never follow
 * redirects, so the token is only sent to the configured host.
 */
export function assistantModel(env: ModelEnv, outfitterToken?: string | null): AssistantModel | null {
  const token = outfitterToken || env.OUTFITTER_INFERENCE_TOKEN;
  if (token) {
    const name = env.OUTFITTER_INFERENCE_MODEL || OUTFITTER_MODEL;
    const outfitter = createOpenAI({
      name: "outfitter",
      baseURL: outfitterUrl(env.OUTFITTER_INFERENCE_URL),
      apiKey: token,
      fetch: (input, init) => fetch(input, { ...init, redirect: "error" }),
    });
    return {
      label: `Outfitter ${name}`,
      // The relay speaks Chat Completions only.
      model: outfitter.chat(name),
      providerOptions: { openai: { reasoningEffort: "low" } },
      cache: undefined,
    };
  }
  if (env.ANTHROPIC_API_KEY) {
    return {
      label: "Claude",
      model: createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })(CLAUDE_MODEL),
      providerOptions: { anthropic: { effort: "low", fallbacks: "default" } },
      cache: { anthropic: { cacheControl: { type: "ephemeral" } } },
    };
  }
  return null;
}
