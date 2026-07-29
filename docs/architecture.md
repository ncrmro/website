# Architecture

How ncrmro.com is put together. See [CONTRIBUTING.md](../CONTRIBUTING.md) for
how to work on it.

## Stack

- **Framework**: Astro 6, server output with prerendered routes, in `code/web/`
- **Adapter**: `@astrojs/cloudflare` → Cloudflare Workers (`ncrmro-website`);
  the `dist/` build output is served as static assets
- **Content**: MDX in `docs/posts/`, validated by a Zod schema
- **Styling**: Tailwind 4 via the `@tailwindcss/vite` plugin
- **Package manager**: bun (single lockfile, `code/web/bun.lock`)
- **Dev shell**: devenv, loaded by direnv

## Layout

```
.
├── docs/
│   ├── posts/               MDX posts — the content root
│   ├── architecture.md      This file
│   └── README.md            Specs, conventions, research notes
├── code/web/                The Astro app
│   ├── src/
│   │   ├── content.config.ts    Zod schemas for the `blog` and `jobs` collections
│   │   ├── content/jobs/        Résumé entries
│   │   ├── pages/               Routes
│   │   ├── layouts/             Page shells
│   │   ├── components/
│   │   └── lib/                 posts.ts (slug/visibility helpers), auth.ts
│   ├── public/posts/<slug>/media/   Legacy post images (Git LFS)
│   ├── db/                  Drizzle schema (inert scaffolding)
│   ├── drizzle/             SQL migrations (inert scaffolding)
│   ├── astro.config.mjs
│   ├── drizzle.config.ts
│   └── wrangler.jsonc
├── devenv.nix
└── posts -> docs/posts      Convenience symlink
```

The split is deliberate: content sits at the repository root, outside the
Astro app, because the site is only one consumer of it. `code/` leaves room
for a second consumer without moving the posts again.

## Content pipeline

Posts are MDX files in **`docs/posts/`**, named `YYYY-MM-DD-<slug>.mdx`. Each
one is a synced copy of its canonical source in the notes vault
(`~/notes/publications/<date>-<slug>/index.mdx`); `sync-posts.sh` there
renders it into `docs/posts/`, commits, and pushes to `main`. The vault is the
canonical home — this repo is a render target.

- The Astro `blog` collection loads `docs/posts/` through a relative `base` in
  `code/web/src/content.config.ts`, where the Zod schema lives. The schema
  requires `title`; optional fields are `description`, `publish_date`
  (coerced date), `published` (default false), `draft` (default false), `tags`
  (default `[]`), `places` (travel posts), and `heroImage` (filename).
- `postSlug()` in `code/web/src/lib/posts.ts` strips the date prefix, so
  public URLs stay `/posts/<slug>/`.
- Visibility is `isPublic()` — `published && !draft`. The sync stamps
  `draft: true` on anything not yet published, so unpublished work lands here
  but renders only at `/drafts/<slug>` behind the admin session. Under
  `bun run dev` that check is skipped and `isVisibleInLocalDevelopment()`
  lists drafts alongside published posts.

### Posts stay portable

A post is a byte-identical copy of a vault file, so it cannot depend on this
repo's layout: no import statements, no client directives. Components reach a
post the other way round — the route injects them via
`<Content components={{ … }} />` (Astro's documented mechanism), and a
framework island gets an `.astro` wrapper here that owns its `client:*`
directive. See `code/web/src/components/ApolloReplayMap.astro`.

### Media

New media is uploaded to Cloudflare R2 by the vault's `sync-media.sh` and
referenced from posts by absolute URL
(`https://r2.ncrmro.com/posts/<slug>/media/<file>`) — which is what keeps
posts portable. Legacy media under `code/web/public/posts/<slug>/media/`
predates R2 and stays in Git LFS (`.gitattributes` routes `*.jpg`, `*.jpeg`,
`*.png`, `*.gif`, `*.webp`, `*.avif`).

## Deployment topology

- `.github/workflows/deploy.yml` — production on push to `main`. Runs
  `bun run db:migrate`, then `wrangler deploy`. Path-filtered on `docs/posts/`
  and `code/web/`, and checks out with `lfs: true` so LFS media isn't shipped
  as pointer files.
- `.github/workflows/preview.yml` — versioned Cloudflare alias for PRs from
  the same repo; comments the URL on the PR (single comment, dedup'd by an
  HTML marker). Alias pattern
  `<branch-slug>-ncrmro-website.<acct>.workers.dev`.
- `.github/workflows/validate.yml` — `astro build` on PRs (fork-safe).
- `.github/actions/cloudflare-deploy/action.yml` — composite action shared by
  deploy and preview.

Because the site deploys on a push to `main` and the vault sync pushes to
`main`, syncing a published piece publishes it. There is no separate release
step.

## DB scaffolding

`code/web/db/` (Drizzle schema) and `code/web/drizzle/` (SQL migrations) are
inert scaffolding from a previous Turso integration. There is no runtime DB
client and no application code reads from `db/schema*.ts` today.
`drizzle.config.ts` points at `db/schema.ts` and switches between Turso and a
local sqlite/libsql URL depending on `TURSO_AUTH_TOKEN`, so `drizzle-kit` runs
but has nothing to talk to.

To revive it:

1. Add a libsql client wherever it's needed (an Astro endpoint, etc).
2. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. Run `bun run db:migrate`.

The `Deploy` workflow already runs `bun run db:migrate` before the worker
deploy, so production migrations work as soon as the secrets are populated.
