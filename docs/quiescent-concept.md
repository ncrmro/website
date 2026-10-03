# Quiescent migration and cutover

The prepared full migration uses one post backend: Quiescent on the existing
`ncrmro-website` Worker. Public slugs, dates, tags, categories, redirects, RSS,
sitemap, projects and résumé are preserved. Astro's remaining `jobs` collection
serves only the résumé. The old MDX loader, draft reader, vault read-only rows,
Drizzle/Turso scaffolding and dual-source routing have been removed.

## Verified migration and live cutover

The migration manifest records 73 documents: 42 public and 31 unpublished drafts, including two scratch drafts formerly in `public/hold`.
All 73 decode through the real Quiescent document layout and schema. Inverse
image-reference substitutions reproduce every original body exactly. All 43
original images, totalling 136,045,387 bytes, match their original Git LFS hashes;
R2 upload/download readback verifies the same hashes. Unreferenced originals are
retained, including on later document-folder renames. Astro image metadata
decodes all 43 originals (31 JPEG, 10 PNG, 2 GIF), including oversized imports.

Published documents are prepared in `content/posts`. Unpublished documents are
stored in dedicated `quiescent/posts/<UUID>/<UUID>` branches; do not publish them to
import them. The manifest and migration scripts are one-time import evidence,
not a second runtime content source. The pre-migration safety ref is
`refs/quiescent-migration/prepared-b5c52b93e92c` at
`817ddf88079d8d076883e6567ba8e03c11ede370`.

The user installed `SERVICE_TOKEN`, and the migration plus all 31 draft branches
are on GitHub. Commit `fac9ba8b` was deployed to `ncrmro.com` as Worker version
`e295251e-28aa-457b-9aa5-61d91cb3723a`. Live checks confirmed all 42 imported
published sitemap entries, exclusion of all 31 imported drafts, authentication
boundaries, mobile layout, responsive WebP delivery, original GIF integrity, and
whole-page cache hits. Authenticated live save/publish/delete and mutation-driven
cache warming remain pending the user's signed-in test. Without a token, public
post routes return a noncacheable 503; there is no legacy fallback. The latest
pre-cutover rollback version retaining the token is
`9d19015b-133f-45b5-abf1-84089ac2c54d`.

## Document and editor contract

`code/web/quiescent.config.json` targets `ncrmro/website`, branch
`feat/quiescent-concept`, directory `content/posts`, and `{createdAt}-{slug}`
folders. Each document has a stable UUID and a date-only creation date. Metadata
preserves the exact publication date (date or timestamp), places, kind,
canonical URL, scheduled publication metadata and syndication fields. Workflow
state determines publication; private drafts never become public to import them.

`/admin` wraps the app-owned post list. `/admin/posts/new` and
`/admin/posts/<UUID>/edit` share the mobile editor. `/admin/posts` redirects to
`/admin`; `/write` is removed. The existing Google JWT allowlist protects the
whole admin namespace, `/api/documents/posts` and `/api/tags/posts`. Mutations
require same-origin requests. Private responses are `private, no-store`, and
public navigation resolves admin links through a noncacheable server island.

The editor automatically uses lossless Markdown source mode when its visual
parse/serialize would change a body. The public app renderer handles GFM tables,
code, safe HTML/SVG and the explicit `<ApolloReplayMap />` component marker;
Markdown is never executed as JavaScript. All source bytes remain in Git.

Body and header images refer to bare filenames. Originals use Git LFS plus a
reconstructible R2 cache. JPEG/PNG/WebP delivery uses Astro responsive transforms;
GIF delivery uses the original animated bytes. New browser uploads remain limited
to 10 MiB; stored originals and LFS rehydration support up to 32 MiB.

The local browser save check used the imported SVG/table/code draft
`what-a-kilogram-costs`: its source body survived byte-for-byte apart from the
intended appended text, and kind, canonical, publish_at, syndication, places and
publish_date survived metadata save and schema validation.

## Bindings and deployment

Retain the existing Google/Auth.js secrets and vars. Configure:

- `SERVICE_TOKEN`: GitHub token restricted to `ncrmro/website`, contents read/write,
  including draft branches, publication commits and Git LFS. Never commit it.
- `WRITING_MEDIA`: R2 bucket `ncrmro-website-quiescent-media`.
- `WRITING_CACHE`: disposable D1 database `ncrmro-website-document-cache`.
- `WRITING_SELF`: service binding to `ncrmro-website` for publication cache warming.
- `IMAGES`: Cloudflare Images for responsive delivery transforms.

Astro sessions are disabled because authentication uses JWT; no SESSION KV or
Turso database is used. Repository routing comes from JSON, not env overrides.
Writing is allowed on `ncrmro.com`, `ncrmro-website.ncrmro.workers.dev` and local
loopback hosts. Version previews are read-only: **all** document API methods are
denied there because even GET can create a draft branch. Their editor/list does
not mount draft-fetching code.

Build and deploy the compiled `dist/server/wrangler.json`. Main code pushes still
auto-deploy and can overwrite a concept deployment. Content-only commits do not
trigger Worker deployment; Quiescent handles native cache invalidation and eager
warming for index, categories, readers, RSS and sitemap. Disable the old external
vault sync before merging the cutover; it is outside this repository and was not
modified by this change. Ordinary public GET requests may prewarm pages; no
public cache-mutation endpoint is exposed.

The pre-concept Worker rollback version is
`923b0a2a-1e9b-4bd4-bbb4-f04b6af61182`. This branch intentionally still publishes
to itself; choose and reconcile the final published branch before merge.

Initialize a fresh listing-cache database using the schema bundled with the
vendored library (from `code/web`):

```sh
node node_modules/wrangler/bin/wrangler.js d1 execute WRITING_CACHE --config wrangler.jsonc --remote --file node_modules/@quiescent/server/dist/documents-cache.schema.sql
```

Use `--local` for local Worker development. The schema is idempotent. The cache
contains private draft projections and is accessed only behind admin authorization;
it can be discarded and rebuilt from Git. Main remains the library default, while
this unmerged migration keeps its explicit publication-branch override.

## Validation

From the repository root:

```sh
devenv shell -- bash -c 'cd code/web && bun install --frozen-lockfile && bun run cf-typegen && node --test tests/markdown.test.mjs && bun run check && bun run build'
```

If the Ocean cache is unavailable, prefix with
`NIX_CONFIG='substituters = https://cache.nixos.org https://devenv.cachix.org'`.

For a built local Worker, allocate a free checkout-specific port and run
`bunx wrangler dev --config dist/server/wrangler.json --local --port <port>`.
Run `BASE_URL=http://127.0.0.1:<port> EXPECT_POSTS_UNAVAILABLE=1 node tests/writing-smoke.mjs`
when no repository token is configured. Optional `TEST_AUTH_SECRET` exercises
local JWT allowlist checks using matching local Worker auth vars; it refuses
non-loopback hosts. A separate local Worker with
`--local-upstream concept-preview-ncrmro-website.ncrmro.workers.dev --upstream-protocol http`
can be passed as `PREVIEW_URL` to check all-method preview API denial.
