// @ts-check
/**
 * @type {import("next").NextConfig}
 **/
module.exports = {
  experimental: {
    serverActions: true,
    typedRoutes: true,
  },
  output: "standalone",
  reactStrictMode: true,
  serverRuntimeConfig: {
    CONTACT_INFO_JSON:
      process.env.CONTACT_INFO_JSON ||
      '{"key": "adsfadf","phoneNumber": "2993330000","email": "coolemail@gmail.com"}',
  },
  env: {
    GOOGLE_ANALYTICS_TRACKING_ID: "UA-79226152-1",
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
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
