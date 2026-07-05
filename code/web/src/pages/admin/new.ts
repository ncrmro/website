import type { APIRoute } from 'astro';
import { CONTENT_DIR, editHref } from '../../lib/quiescent';

export const prerender = false;

export const GET: APIRoute = ({ url, redirect }) => {
	const slug = url.searchParams.get('slug')?.trim().replace(/[^a-z0-9-]/g, '');
	if (!slug) return redirect('/admin');
	return redirect(`${editHref(`${CONTENT_DIR}/${slug}.mdx`)}?new=1`);
};
