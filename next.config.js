module.exports = {
  future: {
    webpack5: true,
  },
  reactStrictMode: true,
  target: "experimental-serverless-trace",
  env: {
    POSTS_DIR: `${__dirname}/posts`,
    WEB_DEBUG: process.env.WEB_DEBUG,
    ENVIRONMENT: process.env.ENVIRONMENT,
    // RELEASE: process.env.RELEASE,
    GOOGLE_ANALYTICS_CODE: "UA-79226152-1",
    GOOGLE_ANALYTICS_ENABLED: process.env.GOOGLE_ANALYTICS_ENABLED,
    // SENTRY_ENABLED: process.env.SENTRY_ENABLED,
  },
  // i18n: {
  //   locales: ["en-US", "de"],
  //   defaultLocale: "en-US",
  // },
  async redirects() {
    return [
      {
        source: "/posts/multi_arch_docker_buildx_ci_cd",
        destination: "/posts/multi-arch-docker-buildx-ci-cd",
        permanent: true,
      },
      {
        source: "/posts/writing_a_gear_torque_calculator",
        destination: "/posts/writing-a-gear-torque-calculator",
        permanent: true,
      },
    ];
  },
};
