import { Auth, type AuthConfig, type Session } from '@auth/core';
import Google from '@auth/core/providers/google';

export const ALLOWED_EMAIL = 'ncrmro@gmail.com';

export type AuthEnv = {
	AUTH_SECRET?: string;
	AUTH_GOOGLE_ID?: string;
	AUTH_GOOGLE_SECRET?: string;
	AUTH_REDIRECT_PROXY_URL?: string;
};

function requireSecret(env: AuthEnv, key: keyof AuthEnv): string {
	const value = env[key];
	if (!value) throw new Error(`Missing required auth secret ${key}.`);
	return value;
}

function isAllowedEmail(email: string | null | undefined): boolean {
	return email?.toLowerCase() === ALLOWED_EMAIL;
}

export function authConfig(env: AuthEnv): AuthConfig {
	return {
		basePath: '/api/auth',
		secret: requireSecret(env, 'AUTH_SECRET'),
		redirectProxyUrl: env.AUTH_REDIRECT_PROXY_URL,
		trustHost: true,
		session: { strategy: 'jwt' },
		providers: [
			Google({
				clientId: requireSecret(env, 'AUTH_GOOGLE_ID'),
				clientSecret: requireSecret(env, 'AUTH_GOOGLE_SECRET'),
			}),
		],
		callbacks: {
			async signIn({ profile, user }) {
				return isAllowedEmail(profile?.email ?? user.email);
			},
			async session({ session, token }) {
				if (session.user && token.email) session.user.email = token.email;
				return session;
			},
		},
	};
}

export async function authHandler(request: Request, env: AuthEnv): Promise<Response> {
	return Auth(request, authConfig(env));
}

export async function getSession(request: Request, env: AuthEnv): Promise<Session | null> {
	const url = new URL(request.url);
	const sessionRequest = new Request(`${url.origin}/api/auth/session`, {
		headers: { cookie: request.headers.get('cookie') ?? '' },
	});
	const response = await Auth(sessionRequest, authConfig(env));
	if (!response.ok) return null;
	const session = await response.json() as Session | Record<string, never> | null;
	return session && typeof session === 'object' && 'user' in session ? session as Session : null;
}

export async function requireAdminSession(request: Request, env: AuthEnv): Promise<Session> {
	const session = await getSession(request, env);
	const email = session?.user?.email;
	if (!isAllowedEmail(email)) throw new Error('Unauthorized');
	return session;
}
