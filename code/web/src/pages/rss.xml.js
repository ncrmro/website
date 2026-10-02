import { publicSlug } from "../writing/policy";
import { writingPosts } from '../writing/public-posts';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { isPublic } from '../lib/posts';

export async function GET(context) {
	const posts = [...await getCollection('blog', isPublic), ...await writingPosts(context.url.origin, context.cache)].sort(
		(a, b) => (b.data.publish_date?.valueOf() ?? 0) - (a.data.publish_date?.valueOf() ?? 0),
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publish_date,
			link: `/posts/${publicSlug(post)}/`,
		})),
	});
}
