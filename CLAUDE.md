# CLAUDE.md

Guidance for Claude Code working in this repo.

## Stack

- **Astro 6** (`@astrojs/cloudflare` adapter, server output + prerendered
  routes), TypeScript, **Tailwind 4** via `@tailwindcss/vite`.
- **MDX** content collection at `src/content/blog/` with a Zod schema
  in `src/content.config.ts`.
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

Schema (`src/content.config.ts`) requires `title`; optional fields:
`description`, `publish_date` (coerced date), `published` (default false),
`tags` (default []), `places` (travel posts), `heroImage` (filename).

The `/posts/` index and `/posts/<slug>/` pages filter on
`data.published === true`. Drafts (`published: false`) are written and
committed but won't render until flipped.

When adding posts: `src/content/blog/<slug>.mdx` (kebab-case). Media goes
in `public/posts/<slug>/media/<file>`; reference with absolute path like
`![alt](/posts/<slug>/media/photo.jpg)`.

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
