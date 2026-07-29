# Contributing

How to work on ncrmro.com. [docs/architecture.md](docs/architecture.md) covers
how the site is put together; [README.md](README.md) covers writing posts.

## Dev shell

The toolchain (Node 22, bun, wrangler, Playwright browsers) comes from
[devenv](https://devenv.sh). Direnv loads it via `.envrc` — run `direnv allow`
on first use, or `devenv shell` manually. (`.envrc` falls back to `use flake`,
but there is no `flake.nix` today, so devenv is required.)

## Commands

Run from `code/web`, inside the dev shell.

| Command              | Action                                           |
| :------------------- | :----------------------------------------------- |
| `bun install`        | Install dependencies                             |
| `bun run dev`        | Astro dev server (`localhost:4321`)              |
| `bun run build`      | Build to `./dist/`                               |
| `bun run preview`    | Build + local preview                            |
| `bun run deploy`     | Build + `wrangler deploy`                        |
| `bun run cf-typegen` | Regenerate `worker-configuration.d.ts`           |
| `bun run db:migrate` | Apply Drizzle migrations (only once a DB exists) |

## Conventions

- Don't edit `docs/posts/` — those files are synced from the notes vault and
  local changes are overwritten. Rendering and routing changes belong here.
- Adding a component to a post is a two-repo change: the post stays portable,
  so the route injects the component and any framework island needs an
  `.astro` wrapper here. See
  [docs/architecture.md](docs/architecture.md#posts-stay-portable).
- Conventional Commits: `type(scope): subject`. Common scopes: `astro`, `ci`;
  none for cross-cutting changes.
- Don't hand-edit `bun.lock` — let `bun install` regenerate it.
- Don't run `playwright install`; the dev shell provides browsers via
  `playwright-driver.browsers`.

## Deploy configuration

Pushes to `main` deploy automatically (see
[docs/architecture.md](docs/architecture.md#deployment-topology)). The repo
needs:

- Secret `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit)
- Variable `CLOUDFLARE_ACCOUNT_ID`
- Environment `production` (used by `deploy.yml`)
- Optional secrets `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (only if the DB
  scaffolding is revived)
