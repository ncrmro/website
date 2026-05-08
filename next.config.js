const createMDX = require("@next/mdx");

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      ["remark-frontmatter", ["yaml"]],
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
      "remark-gfm",
    ],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  env: {
    GOOGLE_ANALYTICS_TRACKING_ID: "G-6MYGCJZSVN",
  },
  images: {
    unoptimized: true,
  },
};

module.exports = withMDX(nextConfig);
