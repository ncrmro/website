import { env as cfEnv } from 'cloudflare:workers';
import { defineMiddleware } from 'astro:middleware';
import { quiescentEnv, resolveQuiescentSession } from './lib/quiescent';

function isGuarded(pathname: string): boolean {
	if (pathname.startsWith('/admin/auth/')) return false;
	return pathname.startsWith('/admin') || pathname.startsWith('/api/quiescent/');
}

// The public site passes straight through; only the admin editor and its
// API require a forge (GitHub) session.
export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	if (!isGuarded(pathname)) return next();

	const env = quiescentEnv(cfEnv);
	const resolved = await resolveQuiescentSession(env, context.request);

	if (!resolved) {
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'unauthenticated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return context.redirect('/admin/auth/login');
	}

	context.locals.qsSession = resolved.session;
	context.locals.qsSessionId = resolved.sessionId;
	return next();
});
