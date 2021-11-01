import ReactGA from "react-ga";
import config from "@utils/config";

export const initializeAnalaytics = (): void => {
  if (
    config.isClient &&
    config.googleAnalytics.enabled &&
    // @ts-ignore
    !window.GA_INITIALIZED
  ) {
    if (config.debug) {
      console.debug(
        `Initializing Google Analytics: ${config.googleAnalytics.trackingCode}`
      );
    }

    const { trackingCode, options } = config.googleAnalytics;
    // if (viewer) {
    //   options.gaOptions = { userId: viewer.id };
    // }
    ReactGA.initialize(trackingCode, options);
    // @ts-ignore
    window.GA_INITIALIZED = true;
  }
};

export const logPageView = (url: string): void => {
  // @ts-ignore
  if (window.GA_INITIALIZED) {
    if (config.debug) {
      console.debug("PAGE VIEW", url);
    }
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(url);
  }
};
