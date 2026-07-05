import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { ConflictError } from '@quiescent/git';
import { flushDrafts, listUserDrafts } from '@quiescent/server';
import { quiescentEnv } from '../../../lib/quiescent';

export const prerender = false;

export const POST: APIRoute = async ({ locals, url }) => {
	const env = quiescentEnv(cfEnv);
	const session = locals.qsSession!;
	const drafts = await listUserDrafts(env, session.userId);

	try {
		const result = await flushDrafts({
			env,
			origin: url.origin,
			sessionId: locals.qsSessionId!,
			session,
			drafts,
		});
		return new Response(JSON.stringify(result ?? { mode: 'noop' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		if (error instanceof ConflictError) {
			return new Response(JSON.stringify({ error: 'conflict', message: error.message }), {
				status: 409,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		throw error;
	}
};
