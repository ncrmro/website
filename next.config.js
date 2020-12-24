module.exports = {
  reactStrictMode: true,
  target: "experimental-serverless-trace",
  env: {
    POSTS_DIR: `${__dirname}/posts`,
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
