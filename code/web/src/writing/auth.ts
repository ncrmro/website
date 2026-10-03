import { requireAdminSession, type AuthEnv } from "../lib/auth";
export async function writingAuthor(request: Request, env: AuthEnv): Promise<boolean> {
  try { await requireAdminSession(request, env); return true; } catch { return false; }
}
