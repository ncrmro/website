import { publicSlug } from "../writing/policy";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { isPublic } from "../lib/posts";
import { writingPosts } from "../writing/public-posts";
export const GET: APIRoute = async (context) => {
 const posts = [...await getCollection("blog", isPublic), ...await writingPosts(context.url.origin, context.cache)];
 const paths = ["/", "/about/", "/resume/", "/posts/", "/posts/food/", "/posts/tech/", "/posts/travel/", "/projects/", "/projects/catalyst/", "/projects/keystone/", "/projects/latinum/", "/projects/meze/", ...posts.map(post => `/posts/${encodeURIComponent(publicSlug(post))}/`)];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...new Set(paths)].map(path => `<url><loc>https://ncrmro.com${path}</loc></url>`).join("") + '</urlset>', {headers: {"Content-Type": "application/xml; charset=utf-8"}});
};
