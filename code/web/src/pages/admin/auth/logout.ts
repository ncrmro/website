import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import {
	deleteSession,
	readCookie,
	SESSION_COOKIE,
	verifySessionCookie,
} from '@quiescent/server';
import { quiescentEnv } from '../../../lib/quiescent';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, cookies, redirect }) => {
	const env = quiescentEnv(cfEnv);
	const cookie = readCookie(request.headers.get('Cookie'), SESSION_COOKIE);
	const sessionId = cookie ? await verifySessionCookie(env, cookie) : null;
	if (sessionId) await deleteSession(env, sessionId);
	cookies.delete(SESSION_COOKIE, { path: '/' });
	return redirect('/');
};
