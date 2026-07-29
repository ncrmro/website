# CLAUDE.md

Guidance for Claude Code working in this repo.

## Stack

- **Astro 6** (`@astrojs/cloudflare` adapter, server output + prerendered
  routes), TypeScript, **Tailwind 4** via `@tailwindcss/vite`.
- **MDX** posts at `docs/posts/` in the *repository root* — not under the
  Astro app. The collection loads them via a relative `base` in
  `code/web/src/content.config.ts`, where the Zod schema lives.
- **bun** is the package manager (single lockfile: `bun.lock`).
- **Cloudflare Workers** deploy via `wrangler deploy`. The build output
  in `dist/` is served as static assets via `@astrojs/cloudflare`.
- **Git LFS** for binary media under `public/posts/<slug>/media/`
  (`.gitattributes` routes `*.jpg`, `*.png`, `*.jpeg`, `*.gif`).

## Commands

Run inside the devenv shell. Direnv loads it via `.envrc` (`use devenv`;
run `direnv allow` on first use).

- `bun run dev` — Astro dev server (`localhost:4321`)
- `bun run build` — build to `./dist/`
- `bun run deploy` — build + `wrangler deploy`
- `bun run db:migrate` — apply Drizzle migrations (only when DB is wired up)

## Content collection

**Posts are not authored here.** Their canonical home is the notes vault
(`~/notes/publications/<date>-<slug>/index.mdx`), and `sync-posts.sh` there
copies them into `docs/posts/<date>-<slug>.mdx`, commits, and pushes to
`main`. Editing a post in this repo will be overwritten by the next sync.
The root `posts` symlink points at `docs/posts` for convenience.

Filenames carry a `YYYY-MM-DD-` prefix mirroring the vault directory;
`postSlug()` in `src/lib/posts.ts` strips it so URLs stay `/posts/<slug>/`.

Schema (`src/content.config.ts`) requires `title`; optional fields:
`description`, `publish_date` (coerced date), `published` (default false),
`draft` (default false), `tags` (default []), `places` (travel posts),
`heroImage` (filename). Public routes filter on `isPublic()` —
`published && !draft`. The sync stamps `draft: true` on anything not yet
published, so it lands here but renders only at `/drafts/<slug>` behind the
admin session.

**Components in posts.** A post must stay portable — it is a copy of a vault
file and cannot depend on this repo's layout, so it carries no import
statements and no client directives. Instead the routes inject components via
`<Content components={{ … }} />` (Astro's documented mechanism), and a
framework island gets an `.astro` wrapper here that owns its `client:*`
directive — see `src/components/ApolloReplayMap.astro`.

Media: uploaded to Cloudflare R2 by the vault's `sync-media.sh` and referenced
by absolute URL (`https://r2.ncrmro.com/posts/<slug>/media/<file>`). Legacy
media under `public/posts/<slug>/media/` predates that and stays in Git LFS.

## DB scaffolding

`db/` (Drizzle schema TS files) and `drizzle/` (SQL migrations) are kept
as inert scaffolding from a previous Turso integration. There is no
runtime DB client today. `drizzle.config.ts` points at `db/schema.ts`;
`drizzle-kit` runs but has nothing to talk to until `TURSO_*` env vars
are set.

The `Deploy` workflow runs `bun run db:migrate` before deploy, so reviving
the DB is mostly adding back the runtime client and populating env
secrets.

## CI

- `.github/workflows/validate.yml` — `astro build` on PRs (fork-safe).
- `.github/workflows/preview.yml` — versioned Cloudflare alias on PRs
  from the same repo; comments the URL on the PR (single comment,
  dedup'd by an HTML marker).
- `.github/workflows/deploy.yml` — production on push to `main`. Runs
  `bun run db:migrate` then `wrangler deploy`.
- `.github/actions/cloudflare-deploy/action.yml` — composite action
  shared by deploy and preview.

Worker name: `ncrmro-website` (per `wrangler.jsonc`). The preview
alias URL pattern is
`<branch-slug>-ncrmro-website.<acct>.workers.dev`.

## Conventions

- Conventional Commits: `type(scope): subject`. Common scopes: `astro`,
  `ci`, none for cross-cutting changes.
- Don't hand-edit `bun.lock` — let `bun install` regenerate.
- Avoid running `playwright install` — the devenv shell provides
  browsers via `playwright-driver.browsers`. (No Playwright tests live
  here today, but the dep is still wired up via the dev shell.)
