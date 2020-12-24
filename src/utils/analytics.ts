import ReactGA from "react-ga";
import config from "@utils/config";

export const initializeAnalaytics = (): void => {
  if (
    config.isClient &&
    config.googleAnalytics.enabled &&
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
    window.GA_INITIALIZED = true;
  }
};
