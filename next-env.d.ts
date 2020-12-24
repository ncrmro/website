/// <reference types="next" />
/// <reference types="next/types/global" />

import { User } from "@gqlgen";

declare global {
  type stringBool = "true" | "false";
  namespace NodeJS {
    interface ProcessEnv {
      RELEASE: string;
      WEB_DEBUG: stringBool;
      SENTRY_ENABLED: stringBool;
      GOOGLE_ANALYTICS_ENABLED: stringBool;
      ENVIRONMENT: "development" | "staging" | "production";
    }
  }
  interface Window {
    GA_INITIALIZED: boolean;
  }
}

export {};
