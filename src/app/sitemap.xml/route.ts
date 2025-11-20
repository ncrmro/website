import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const rootURL = "https://ncrmro.com";
  const posts = await db
    .select({
      slug: schema.posts.slug,
      updated_at: schema.posts.updated_at,
    })
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.publish_date));
    
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
