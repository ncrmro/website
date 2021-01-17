import { InitializeOptions } from "react-ga";

interface Config {
  production: boolean;
  debug;
  isClient: boolean;
  googleAnalytics: {
    enabled: boolean;
    trackingCode: string;
    options: InitializeOptions;
  };
}

// const debug = process.env.WEB_DEBUG === "true";
const debug = true;

const config: Config = {
  production: process.env.NODE_ENV === "production",
  debug,
  isClient: typeof window !== "undefined",
  googleAnalytics: {
    enabled: process.env.GOOGLE_ANALYTICS_ENABLED === "true",
    trackingCode: process.env.GOOGLE_ANALYTICS_CODE,
    options: {
      debug,
      testMode: process.env.GOOGLE_ANALYTICS_TESTING === "true",
      gaOptions: {},
    },
  },
};

if (config.debug) {
  console.debug("Debug Mode enabled");
  console.debug("Current Config is", config);
}

export default config;
