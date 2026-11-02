# Architecture

`code/web` is an Astro 7 server application deployed to the `ncrmro-website`
Cloudflare Worker. Tailwind provides site styles; the Quiescent packages supply
Git document storage, draft lifecycle, media storage, editor controls and page
cache invalidation. Four released packages are installed from npm with a committed lockfile.

## Documents

`code/web/quiescent.config.json` declares GitHub repository `ncrmro/website`,
published branch `main`, `content/posts`, filename convention
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

The new/edit post editor and dictation preview check the local `en-US` speech pack
on initialization and automatically download it when Chrome reports it downloadable
or downloading. Download progress and failures are shown without blocking writing;
microphone access and recognition still require the Dictate button. Unsupported
browsers retain Quiescent's disabled dictation control, with no cloud fallback.

Only the jobs collection remains in Astro content collections, for the résumé.
No Drizzle/Turso or authentication database is used. A disposable D1 document
listing cache (`WRITING_CACHE`) serves private admin lists without GitHub reads.
Quiescent updates it after successful Git mutations, builds it on first read, and
refreshes stale entries in the background after one hour. Git remains authoritative.
The admin shows last fetch/update status, a manual refresh button, and local search.
The portable cache and D1 adapter live in `@quiescent/server`; presentation remains
here. Public Astro HTML caching remains separate and never reads cached drafts.

## Writing assistant

The admin has a writing assistant sidebar: a React island (`client:only`) built
on the AI SDK's `useChat`, in `code/web/src/assistant/`. It is the only React on
the site and loads only on `/admin` and the post editor. Its threads follow
ai-outfitter's thread model, reduced to one author:

- The **writing desk** (`writing-desk`) is the admin-wide, always-present parent
  thread. Its tools can list and read every saved post (from the private D1
  listing, never a branch checkout) and every other thread.
- Each post has its own thread (`post-<UUID>`), a child of the desk. Messages
  sent from the editor carry the on-screen draft.
- Any thread can start subthreads (`parent_id`) to explore an idea.

Threads live in D1 under the `ASSISTANT_DB` binding (`assistant_threads`,
`assistant_entries`, created on first use). Unlike `WRITING_CACHE` they are
durable; the binding currently points at the same database, and moving it to
a dedicated one is a `wrangler.jsonc` change. Threads never write documents:
Git and Quiescent remain the only post store.

`/api/assistant/*` sits behind the admin session, the POST origin check and
`canPublish` (previews never call the model). Replies stream from
`claude-opus-5-5` through `@ai-sdk/anthropic` and need the Worker secret
`ANTHROPIC_API_KEY`; without it the routes answer 503. Brain dumps use the
editor's on-device dictation, so only text transcripts leave the browser.
Assistant text is rendered as text, never HTML.

## Deployment

Build with `bun run build` and deploy `dist/server/wrangler.json`. Main pushes
still auto-deploy; PR previews are read-only. See
[quiescent-concept.md](quiescent-concept.md) for bindings, credentials, migration
verification and the deployment gate. Never deploy the full cutover until the
repository token and migrated public/private data and originals are verified.
