import { NextResponse } from "next/server";
import { db, sql } from "@/lib/database";

export async function GET(request: Request) {
  const rootURL = "https://ncrmro.com";
  const posts = await db
    .selectFrom("posts")
    .select([
      "slug",
      "updated_at",
      // sql<string>`date(updated_at, 'unixepoch', 'utc')`.as("updated_at"),
    ])
    .where("published", "=", 1)
    .orderBy("publish_date", "desc")
    .execute();
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
      ${posts
        .map(
          (p: any) => `<url>
        <loc>${rootURL}/posts/${p.slug}</loc>
        <lastmod>${p.updated_at.split(" ")[0]}</lastmod>
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
