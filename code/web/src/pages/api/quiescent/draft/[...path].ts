import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { deleteDraft, saveDraft } from '@quiescent/server';
import { quiescentEnv } from '../../../../lib/quiescent';

export const prerender = false;

export const PUT: APIRoute = async ({ locals, params, request }) => {
	const env = quiescentEnv(cfEnv);
	const session = locals.qsSession!;
	const path = params.path;
	if (!path) return new Response(JSON.stringify({ error: 'missing path' }), { status: 400 });

	const body = (await request.json()) as { content?: string; baseSha?: string };
	if (typeof body.content !== 'string') {
		return new Response(JSON.stringify({ error: 'content required' }), { status: 400 });
	}

	await saveDraft(env, {
		userId: session.userId,
		sessionId: locals.qsSessionId!,
		path,
		content: body.content,
		baseSha: body.baseSha,
		updatedAt: Date.now(),
	});
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};

// navigator.sendBeacon can only POST.
export const POST = PUT;

export const DELETE: APIRoute = async ({ locals, params }) => {
	const env = quiescentEnv(cfEnv);
	const session = locals.qsSession!;
	if (!params.path) return new Response(null, { status: 400 });
	await deleteDraft(env, session.userId, params.path);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};
