import { NextResponse } from "next/server";
import { db, posts } from "@/database";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const rootURL = "https://ncrmro.com";
  const postsList = await db
    .select({
      slug: posts.slug,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishDate));

  const content = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${rootURL}</loc>
      </url>
      <url>
        <loc>${rootURL}/about</loc>
      </url>
      <url>
        <loc>${rootURL}/resume</loc>
      </url>
      <url>
        <loc>${rootURL}/posts/tech</loc>
      </url>
      <url>
        <loc>${rootURL}/posts/travel</loc>
      </url>
      <url>
        <loc>${rootURL}/posts/food</loc>
      </url>
      ${postsList
        .map(
          (p) => `<url>
        <loc>${rootURL}/posts/${p.slug}</loc>
        <lastmod>${p.updatedAt.split(" ")[0]}</lastmod>
      </url>`
        )
        .join("\n")}
    </urlset>
    `;
  // Return the response with the content, a status 200 message, and the appropriate headers for an XML page
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
}
