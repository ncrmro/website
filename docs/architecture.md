# Architecture

`code/web` is an Astro 7 server application deployed to the `ncrmro-website`
Cloudflare Worker. Tailwind provides site styles; the Quiescent packages supply
Git document storage, draft lifecycle, media storage, editor controls and page
cache invalidation. Four built packages are vendored in `vendor/`.

## Documents

`code/web/quiescent.config.json` declares GitHub repository `ncrmro/website`,
published branch `feat/quiescent-concept`, `content/posts`, filename convention
and metadata schema. Each post has a stable UUID and preserved slug, publication
date, tags and other metadata. Draft visibility is represented by Git branches,
not a public metadata flag. The same document service powers every reader,
category, index, RSS, sitemap and admin view. There is no second post loader.

The public renderer supports GFM Markdown, sanitized HTML/SVG and an explicit
`<ApolloReplayMap />` marker implemented by the app's deck.gl component. It never
executes imported MDX or JavaScript. The editor detects unsupported/lossy visual
roundtrips and keeps the source in its Markdown textarea.

Original images and their filenames stay in Git LFS, including unused originals.
Quiescent preserves these pointers on slug/folder renames. R2 can be restored from
LFS; GIF delivery retains original animation. Browser uploads are limited to
10 MiB; imported originals and LFS retrieval allow up to 32 MiB.

## Administration and authentication

`/admin` wraps the app-owned post list component. `/admin/posts/new` and
`/admin/posts/<UUID>/edit` share the mobile editor. Google Auth.js JWT sessions
retain the single-account allowlist; there is no database-backed session store.
All admin/document APIs are private and noncacheable. Preview hosts cannot access
document APIs even with GET, because opening a document can create a draft branch.

Only the jobs collection remains in Astro content collections, for the résumé.
No Drizzle/Turso or authentication database is used. A disposable D1 document
listing cache (`WRITING_CACHE`) serves private admin lists without GitHub reads.
Quiescent updates it after successful Git mutations, builds it on first read, and
refreshes stale entries in the background after one hour. Git remains authoritative.
The admin shows last fetch/update status, a manual refresh button, and local search.
The portable cache and D1 adapter live in `@quiescent/server`; presentation remains
here. Public Astro HTML caching remains separate and never reads cached drafts.

## Deployment

Build with `bun run build` and deploy `dist/server/wrangler.json`. Main pushes
still auto-deploy; PR previews are read-only. See
[quiescent-concept.md](quiescent-concept.md) for bindings, credentials, migration
verification and the deployment gate. Never deploy the full cutover until the
repository token and migrated public/private data and originals are verified.
