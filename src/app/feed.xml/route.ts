import { NextResponse } from "next/server";
import { db, posts } from "@/database";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = escapeXml(process.env.NEXT_PUBLIC_BASE_URL || 'https://ncrmro.com');

  try {
    const postsList = await db
      .select({
        slug: posts.slug,
        title: posts.title,
        description: posts.description,
        body: posts.body,
        publishDate: posts.publishDate,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.publishDate))
      .limit(50); // Limit to 50 most recent posts

    const latestPostDate = postsList.length > 0 
      ? new Date(postsList[0].updatedAt).toUTCString()
      : new Date().toUTCString();

    const rssItems = postsList
      .map((post) => {
        const pubDate = post.publishDate 
          ? new Date(post.publishDate).toUTCString()
          : new Date(post.updatedAt).toUTCString();
        
        const postUrl = `${baseUrl}/posts/${escapeXml(post.slug)}`;
        
        // Use description if available, otherwise use truncated body
        const description = post.description || (post.body ? post.body.substring(0, 200) + '...' : '');
        
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
      })
      .join('\n');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nicholas Romero</title>
    <link>${baseUrl}</link>
    <description>Personal Site of Nicholas Romero</description>
    <language>en-us</language>
    <lastBuildDate>${latestPostDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
