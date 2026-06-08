Review the changed post-bot/admin/auth files as one feature surface.

Focus on actionable defects only. Report PASS if no issues are found.

Check:

1. Auth boundary
   - Admin pages and `/api/post-bot` MUST require a valid session for `ncrmro@gmail.com` before exposing post content or accepting writes.
   - Public post pages MAY include client-side convenience links, but MUST NOT expose secrets or unpublished content.
   - Sign-in/sign-out callback URLs should be local paths or otherwise safe from open-redirect surprises.

2. OAuth redirect proxy
   - Preview auth MUST use `AUTH_REDIRECT_PROXY_URL`/`AUTH_URL` consistently with the production proxy on `https://ncrmro.com/api/auth`.
   - Changes must not break Auth.js redirect-proxy behavior where production receives the Google callback and sends it back to the preview callback encoded in state.

3. GitHub token and content writes
   - `GITHUB_CONTENT_PAT`/`GITHUB_TOKEN` MUST remain server-side only; no token can be serialized into HTML, client JS, logs, or API responses.
   - GitHub Contents API paths MUST stay scoped to `code/web/src/content/blog/<slug>.mdx`.
   - Slug and branch inputs must be constrained enough to avoid arbitrary repository path writes or surprising branch names.
   - Publishing directly to main should remain explicit and visible.

4. API behavior and data exposure
   - Read endpoints that return full MDX MUST be authenticated.
   - Error responses should be useful without leaking credentials or provider secrets.
   - API JSON shape should remain compatible with the admin form.

5. UX/security footguns
   - The normal post-page edit affordance should only appear for the signed-in admin.
   - Dedicated create/edit pages should preload the right slug and not accidentally create/edit the wrong post.

For each issue, include severity, file:line, why it matters, and a concrete fix.
