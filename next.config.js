// eslint-disable-next-line @typescript-eslint/no-var-requires
// const withSourceMaps = require("@zeit/next-source-maps")();

module.exports =
  // withSourceMaps(
  {
  reactStrictMode: true,
  target: "serverless",
  env: {
    POSTS_DIR: `${__dirname}/posts`,
  },
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en-US", "de"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "en-US",
  },
  // webpack: (config, options) => {
  //   // switch sentry/node for sentry/browser on client
  //   if (!options.isServer) {
  //     config.resolve.alias["@sentry/node"] = "@sentry/react";
  //   }
  //   return config;
  // },
}
// );
