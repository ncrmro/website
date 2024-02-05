import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function GET(request: Request) {
  const rootURL = "https://ncrmro.com";
  const posts = await db
    .selectFrom("posts")
    .select(["slug"])
    .where("published", "=", 1)
    .orderBy("publish_date", "desc")
    .execute();
  console.log(posts);
  const content = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${rootURL}</loc>
      </url>
      ${posts
        .map(
          (p) => `<url>
        <loc>${rootURL}/posts/${p.slug}</loc>
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
