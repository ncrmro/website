import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { createForge, exchangeCode } from '@quiescent/git';
import {
	createSession,
	forgeConfig,
	oauthConfig,
	SESSION_COOKIE,
	sessionCookieValue,
} from '@quiescent/server';
import {
	adminEmails,
	quiescentEnv,
	resolveAdminEmail,
	type AdminSession,
} from '../../../lib/quiescent';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url, cookies, redirect }) => {
	const env = quiescentEnv(cfEnv);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get('qs_state')?.value;
	cookies.delete('qs_state', { path: '/admin/auth' });

	// SECURITY: state check blocks OAuth CSRF (attacker-initiated code injection).
	if (!code || !state || !expectedState || state !== expectedState) {
		return new Response('Invalid OAuth state', { status: 400 });
	}

	const tokens = await exchangeCode(oauthConfig(env, url.origin), code);
	const forge = createForge(forgeConfig(env, tokens.accessToken));
	const user = await forge.getUser();

	// SECURITY: only accounts with a verified allowlisted email get a session
	// at all — everyone else is turned away before /admin is reachable.
	const email = await resolveAdminEmail(tokens.accessToken, adminEmails(env), user.email);
	if (!email) {
		return new Response('This GitHub account is not authorized to use /admin.', {
			status: 403,
		});
	}

	const session: AdminSession = {
		userId: user.id,
		login: user.login,
		// Forced off so flushes always go through a pull request, never a
		// direct commit to main (FLUSH_MODE=pull-request enforces the same
		// from @quiescent/server 0.3).
		canPush: false,
		tokens,
		email,
	};
	const sessionId = await createSession(env, session);
	cookies.set(SESSION_COOKIE, await sessionCookieValue(env, sessionId), {
		path: '/',
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30,
	});
	return redirect('/admin');
};
