import { env as cfEnv } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { authorizeUrl } from '@quiescent/git';
import { oauthConfig } from '@quiescent/server';
import { quiescentEnv } from '../../../lib/quiescent';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url, cookies, redirect }) => {
	const env = quiescentEnv(cfEnv);
	const state = crypto.randomUUID();
	cookies.set('qs_state', state, {
		path: '/admin/auth',
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		maxAge: 600,
	});
	return redirect(authorizeUrl(oauthConfig(env, url.origin), state));
};
