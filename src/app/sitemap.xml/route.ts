import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ncrmro.com";
  const posts = getAllPosts();
  const currentDate = new Date().toISOString();

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/resume</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${posts
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${post.publishDate ?? currentDate.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
