const path = require("path");
const withPWAInit = require("next-pwa");

/** @type {import('next-pwa').PWAConfig} */
const withPWA = withPWAInit({
  dest: "public",
  // Solution: https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1399683017
  buildExcludes: ["app-build-manifest.json"],
});

const generateAppDirEntry = (entry) => {
  const packagePath = require.resolve("next-pwa");
  const packageDirectory = path.dirname(packagePath);
  const registerJs = path.join(packageDirectory, "register.js");

  return entry().then((entries) => {
    // Register SW on App directory, solution: https://github.com/shadowwalker/next-pwa/pull/427
    if (entries["main-app"] && !entries["main-app"].includes(registerJs)) {
      if (Array.isArray(entries["main-app"])) {
        entries["main-app"].unshift(registerJs);
      } else if (typeof entries["main-app"] === "string") {
        entries["main-app"] = [registerJs, entries["main-app"]];
      }
    }
    return entries;
  });
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@libsql/isomorphic-ws'],
  serverRuntimeConfig: {
    CONTACT_INFO_JSON:
      process.env.CONTACT_INFO_JSON ||
      '{"key": "adsfadf","phoneNumber": "2993330000","email": "coolemail@gmail.com"}',
  },
  env: {
    GOOGLE_ANALYTICS_TRACKING_ID: "G-6MYGCJZSVN",
  },
  images: {
    remotePatterns: [
      { hostname: "www.gravatar.com" },
      { hostname: "r2.ncrmro.com" },
    ],
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
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = withPWA(nextConfig);
