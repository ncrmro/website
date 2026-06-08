import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { requireAdminSession, type AuthEnv } from '../../lib/auth';
import { runPostBot, type BotEnv, type PostBotRequest } from '../../lib/githubPostBot';

export const prerender = false;

function json(data: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			...init?.headers,
		},
	});
}

const workerEnv = env as AuthEnv & BotEnv;

export const GET: APIRoute = async ({ request, url }) => {
	try {
		await requireAdminSession(request, workerEnv);
	} catch {
		return json({ error: 'Unauthorized. Sign in with ncrmro@gmail.com.' }, { status: 401 });
	}

	const prNumber = url.searchParams.get('pr');
	const slug = url.searchParams.get('slug');
	const branch = url.searchParams.get('branch') ?? undefined;
	if (!prNumber && !slug) return json({ error: 'Missing ?pr=<number> or ?slug=<post-slug>.' }, { status: 400 });

	try {
		const result = prNumber
			? await runPostBot(workerEnv, { action: 'status', prNumber })
			: await runPostBot(workerEnv, { action: 'get', slug: slug as string, branch });
		return json({ ok: true, result });
	} catch (error) {
		return json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
	}
};

export const POST: APIRoute = async ({ request }) => {
	try {
		await requireAdminSession(request, workerEnv);
	} catch {
		return json({ error: 'Unauthorized. Sign in with ncrmro@gmail.com.' }, { status: 401 });
	}

	try {
		const input = await request.json() as PostBotRequest;
		const result = await runPostBot(workerEnv, input);
		return json({ ok: true, result });
	} catch (error) {
		return json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
	}
};
