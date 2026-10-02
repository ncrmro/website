# Quiescent writing concept

This branch integrates Quiescent into the existing `ncrmro-website` Worker.
Legacy vault-synced MDX, media, public URLs, projects, résumé, redirects and RSS
remain available. Do not edit `docs/posts/` here.

## Content and authentication

`code/web/quiescent.config.json` declares the GitHub repository `ncrmro/website`,
published branch `feat/quiescent-concept`, and the `posts` collection rooted at
`content/posts` with `{createdAt}-{slug}` filenames and an inline JSON Schema.
Draft branches and Git commits are managed by Quiescent. The remote concept
branch must exist before writing is enabled. Publishing does not merge to main.

`/admin`, `/admin/posts/new` and `/admin/posts/<UUID>/edit` use the app-owned post list and shared mobile editor. The list page wraps
`AdminPosts.astro`, so future status or page-view columns can evolve without
library changes. `/admin/posts` redirects to `/admin`; the removed `/write`
URL returns 404. Document APIs remain under `/api/documents/posts` and
`/api/tags/posts`. Vault MDX remains editable in the notes vault. Google JWT
sessions retain the existing `ncrmro@gmail.com` allowlist. Document APIs,
private upload/media APIs and tag suggestions require that session; mutations
also require a matching Origin. There is no example password. Authenticated
navigation is a deferred, noncacheable server island. Private responses are
`private, no-store`; public HTML contains no session-dependent editor controls.

Publishing rejects slugs occupied by legacy MDX, categories, editor routes or
historical redirects. New document slugs are preserved verbatim, including date
prefixes. Home, posts, article routes, RSS and sitemap combine published Git
content with legacy MDX. Public media resolves only published referenced assets;
private draft media stays behind the document API. Uploaded originals use Git
LFS and R2; Markdown retains bare filenames and Cloudflare Images serves variants.

## Worker bindings

Retain the existing Google/Auth.js secrets and vars. Add:

- `SERVICE_TOKEN`: a GitHub token restricted to `ncrmro/website`, with repository
  contents read/write access (draft commits, branches and publishing, including
  Git LFS). Store using Wrangler secrets; never commit it or substitute a broad
  workstation GitHub credential.
- `WRITING_MEDIA`: R2 bucket `ncrmro-website-quiescent-media` (already provisioned).
- `WRITING_SELF`: service binding to `ncrmro-website` for publication cache warming.
- `IMAGES`: Cloudflare Images binding for delivery transforms.

Astro sessions are disabled: authentication uses JWT, so no SESSION KV binding is
needed. No repository env overrides are supported; the JSON file is authoritative.

Without `SERVICE_TOKEN`, legacy pages remain readable. The authenticated editor
explains the missing connection and document APIs return 503. Save, publish, LFS
and R2 acceptance on the live site remain pending until the restricted token is
installed. Local tests use synthetic JWTs only in the local Worker, without
changing production authentication or performing remote writes.

Writing is allowed on `ncrmro.com`, `ncrmro-website.ncrmro.workers.dev` and local
loopback hosts. Versioned/branch preview hosts are read-only and explain this in
the editor; all document API methods are denied and draft fetching is disabled.
Opening a document can create a Git draft branch, even on GET. Their self service binding targets the active Worker, so mutations
must not warm or invalidate a different version.

## Validation and deployment

From the repository root, use the dev shell; tools run inside `code/web`:

```sh
devenv shell -- bash -c 'cd code/web && bun install --frozen-lockfile && bun run cf-typegen && bun run check && bun run build'
```

If the Ocean cache is unavailable, prefix devenv with
`NIX_CONFIG='substituters = https://cache.nixos.org https://devenv.cachix.org'`.
Type generation creates ignored `worker-configuration.d.ts`; optional secrets
are declared separately in `src/secrets.d.ts`.

For a local built-Worker smoke test, allocate a free port for this checkout, run
`bunx wrangler dev --config dist/server/wrangler.json --local --port <port>`, then
`BASE_URL=http://127.0.0.1:<port> node tests/writing-smoke.mjs`. Optional
`TEST_AUTH_SECRET` exercises authenticated local JWT checks when the local Worker
has the matching `AUTH_SECRET`, dummy Google ID/secret, and no `SERVICE_TOKEN`.
This option refuses non-loopback hosts. To test version-preview denial, start a
second local Worker on a separate free port with
`--local-upstream concept-preview-ncrmro-website.ncrmro.workers.dev --upstream-protocol http`
and the same local auth vars, and pass its loopback URL as `PREVIEW_URL`.
The suite then checks document GET/HEAD/POST denial and disabled draft mounting. Tests cover configuration, preserved
MDX routes, sitemap privacy, anonymous API/editor denial, slug/preview policy,
and local admin/outsider JWT behavior with missing Git credentials.

Deploy the compiled config with `bunx wrangler deploy --config dist/server/wrangler.json`.
The worker name remains `ncrmro-website`. Build/deploy/preview workflows include
vendor and JSON configuration changes and use this compiled config. Existing
main auto-deployment remains enabled and can overwrite the concept deployment.
The pre-concept rollback version is `923b0a2a-1e9b-4bd4-bbb4-f04b6af61182`.

Quiescent owns cache tags and authenticated publish/delete invalidation and eager
warming, including index, posts, RSS and sitemap. Ordinary public GET requests
can prewarm pages after deployment. There is no unauthenticated cache-mutation
endpoint. Before merging, set the intended published branch and reconcile any
concept content; this branch intentionally still publishes to itself.
