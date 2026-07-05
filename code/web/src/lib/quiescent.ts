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

export function quiescentEnv(env: unknown): QuiescentEnv {
	return env as QuiescentEnv;
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
