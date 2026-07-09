import { env as cfEnv } from 'cloudflare:workers';
import { defineMiddleware } from 'astro:middleware';
import {
	adminEmails,
	quiescentEnv,
	resolveQuiescentSession,
	type AdminSession,
} from './lib/quiescent';

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

	// SECURITY: sessions are only minted for allowlisted emails, but re-check
	// on every request so removing an address from ADMIN_EMAILS revokes
	// access immediately, existing sessions included.
	const email = (resolved.session as AdminSession).email;
	if (!email || !adminEmails(cfEnv).has(email.toLowerCase())) {
		return new Response('This GitHub account is not authorized to use /admin.', {
			status: 403,
		});
	}

	context.locals.qsSession = resolved.session;
	context.locals.qsSessionId = resolved.sessionId;
	return next();
});
