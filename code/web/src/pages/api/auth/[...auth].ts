import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { authHandler, type AuthEnv } from '../../../lib/auth';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
	try {
		return await authHandler(request, env as AuthEnv);
	} catch (error) {
		return new Response(error instanceof Error ? error.message : 'Auth error', { status: 500 });
	}
};
