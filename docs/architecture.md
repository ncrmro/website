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
on the AI SDK's `useChat`. It is the only React on the site and loads only on
`/admin` and the post editor.

It sits on a small, feature-agnostic thread layer in `code/web/src/threads/`,
modeled on ai-outfitter's thread service:

- `threads`: `id`, a free-form `kind`, `title`, `parent_id` and
  `parent_message_id` (the thread and message it was started from),
  `subject_type`/`subject_id` (the one thing it is about), JSON `metadata`, and
  timestamps.
- `thread_messages`: AI SDK `UIMessage`s saved by id, with `seq` for order, the
  JSON `parts`, a plain `text` copy and JSON `metadata`. A message id never
  moves between threads.
- `thread_schema`: applied migration versions. Schema changes are appended to
  `MIGRATIONS` in `store.ts` and run on first use.
- `reply.ts` runs one turn: it saves the user's message, streams the model's
  reply, and saves it when the stream ends, even if the browser disconnects.

The writing use cases live in `code/web/src/assistant/` as three kinds:

- `writing.desk` (`writing-desk`) is the admin-wide, always-present parent. Its
  tools can list and read every saved post (from the private D1 listing, never
  a branch checkout) and every other thread.
- `writing.post` (`post-<UUID>`, subject `post`) is a child of the desk. Each
  message sent from the editor carries the on-screen draft.
- `writing.idea` is a subthread started from any thread, with its brief in
  `metadata`.

The tables live in D1 under the `ASSISTANT_DB` binding. Unlike `WRITING_CACHE`
they are durable. The binding currently points at the same database; moving it
to a dedicated one is a `wrangler.jsonc` change. Threads never write documents:
Git and Quiescent remain the only post store.

`/api/assistant/*` sits behind the admin session, the POST origin check and
`canPublish` (previews never call the model). The model comes from
`src/assistant/model.ts`. Replies stream from Outfitter's OpenAI-compatible
relay (`https://ai-outfitter.com/api/inference/v1`, model `flash`, GLM on
Outfitter's DGX Spark) through `@ai-sdk/openai`, signed in one of two ways:

- **Connect Outfitter** in the sidebar (`src/assistant/outfitter-login.ts`,
  `/api/assistant/outfitter/{connect,callback}`), Outfitter's standard OAuth 2.1
  authorization code flow with PKCE (ai-outfitter/webapp
  `docs/inference-oauth.md`). The site registers itself once per callback URL
  (RFC 7591, public client, kept in `outfitter_clients`). Connect is a
  same-origin form post that redirects to Outfitter's consent page with scope
  `inference offline_access`; the callback checks the single-use `state`
  (stored hashed in `outfitter_authorizations`, 10 minutes) and `iss`, then
  exchanges the code. The 15-minute access token (bound to the relay) and the
  rotating refresh token live in the `outfitter_login` row of `ASSISTANT_DB`,
  AES-GCM encrypted with a key derived from `AUTH_SECRET`; the browser never
  sees them. Each refresh takes a 20-second lease on the row so other isolates
  wait for its result. A 401 from the relay forces a refresh, and a refused
  refresh means the site was disconnected on Outfitter. Disconnect revokes the
  refresh token.
- The optional Worker secret `OUTFITTER_INFERENCE_TOKEN` (a personal `oftr_inf_`
  token, valid 90 days), used when nobody has connected.

`OUTFITTER_INFERENCE_URL` and `OUTFITTER_INFERENCE_MODEL` override the
defaults; sign-in goes to the relay URL's origin. With neither
sign-in, `ANTHROPIC_API_KEY` selects `claude-opus-5-5`; with nothing the chat
route answers 503. Requests to Outfitter never follow redirects.
Brain dumps use the
editor's on-device dictation, so only text transcripts leave the browser.
Assistant text is rendered as text, never HTML.

## Deployment

Build with `bun run build` and deploy `dist/server/wrangler.json`. Main pushes
still auto-deploy; PR previews are read-only. See
[quiescent-concept.md](quiescent-concept.md) for bindings, credentials, migration
verification and the deployment gate. Never deploy the full cutover until the
repository token and migrated public/private data and originals are verified.
