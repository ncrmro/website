import type { Env as QuiescentEnv, Session } from '@quiescent/server';
import {
	getSessionById,
	readCookie,
	SESSION_COOKIE,
	verifySessionCookie,
} from '@quiescent/server';

/** Repo-relative directory the admin editor roots at. */
export const CONTENT_DIR = 'code/web/src/content/blog';

export type { QuiescentEnv };

/** Session with the verified admin email captured at login. */
export type AdminSession = Session & { email?: string };

export function quiescentEnv(env: unknown): QuiescentEnv {
	return env as QuiescentEnv;
}

/** Verified email addresses allowed into /admin (ADMIN_EMAILS, comma-separated). */
export function adminEmails(env: unknown): Set<string> {
	const raw = (env as { ADMIN_EMAILS?: string }).ADMIN_EMAILS ?? '';
	return new Set(
		raw
			.split(',')
			.map((e) => e.trim().toLowerCase())
			.filter(Boolean),
	);
}

/**
 * Returns the allowlisted verified email of the GitHub account behind the
 * token, or null. Uses /user/emails (the GitHub App needs the "Email
 * addresses" read permission); falls back to the profile email, which GitHub
 * only lets users set to an address they have verified.
 */
export async function resolveAdminEmail(
	accessToken: string,
	allowed: Set<string>,
	profileEmail?: string,
): Promise<string | null> {
	if (allowed.size === 0) return null;
	const response = await fetch('https://api.github.com/user/emails', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/vnd.github+json',
			'User-Agent': 'ncrmro.com-admin',
		},
	});
	if (response.ok) {
		const emails = (await response.json()) as { email: string; verified: boolean }[];
		const match = emails.find((e) => e.verified && allowed.has(e.email.toLowerCase()));
		return match?.email ?? null;
	}
	return profileEmail && allowed.has(profileEmail.toLowerCase()) ? profileEmail : null;
}

export function editHref(path: string): string {
	return `/admin/edit/${path.split('/').map(encodeURIComponent).join('/')}`;
}

export interface ResolvedSession {
	sessionId: string;
	session: Session;
}

/** Verifies the signed quiescent cookie and loads the forge session. */
export async function resolveQuiescentSession(
	env: QuiescentEnv,
	request: Request,
): Promise<ResolvedSession | null> {
	const cookie = readCookie(request.headers.get('Cookie'), SESSION_COOKIE);
	const sessionId = cookie ? await verifySessionCookie(env, cookie) : null;
	const session = sessionId ? await getSessionById(env, sessionId) : null;
	return sessionId && session ? { sessionId, session } : null;
}
