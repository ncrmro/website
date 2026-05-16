# ncrmro.com

Personal site and blog. Astro 6, deployed to Cloudflare Workers via
`@astrojs/cloudflare`.

This repo is mirrored at https://github.com/ncrmro/website and
https://git.ncrmro.com/ncrmro/website.

## Stack

- **Framework**: Astro 6 (server output, prerendered routes)
- **Adapter**: `@astrojs/cloudflare` → Workers
- **Content**: MDX in `src/content/blog/`, validated by a Zod schema in
  `src/content.config.ts`
- **Styling**: Tailwind 4 via the `@tailwindcss/vite` plugin
- **Media**: Tracked in `public/posts/<slug>/media/` with Git LFS for
  binaries (rules in `.gitattributes`)

## Layout

```
.
├── src/
│   ├── content/blog/        MDX posts
│   ├── content.config.ts    Blog Zod schema
│   ├── pages/               Routes
│   ├── layouts/             Page shells
│   └── components/
├── public/posts/<slug>/media/   Post images (LFS)
├── db/                      Drizzle schema (inert scaffolding; see below)
├── drizzle/                 SQL migrations (inert scaffolding)
├── drizzle.config.ts
├── astro.config.mjs
├── wrangler.jsonc
└── flake.nix                Nix dev shell
```

## Commands

Run inside the Nix dev shell (`nix develop` or via direnv).

| Command            | Action                                  |
| :----------------- | :-------------------------------------- |
| `bun install`      | Install dependencies                    |
| `bun run dev`      | Astro dev server (`localhost:4321`)     |
| `bun run build`    | Build to `./dist/`                      |
| `bun run preview`  | Build + local preview                   |
| `bun run deploy`   | Build + `wrangler deploy`               |
| `bun run db:migrate` | Apply Drizzle migrations (Turso)      |

## Database

`db/` and `drizzle/` are kept as inert scaffolding from a previous
Drizzle/Turso integration. There's no live DB and no application code
reads from `db/schema*.ts` today. To revive:

1. Add a libsql client wherever it's needed (Astro endpoint, etc).
2. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars.
3. Run `bun run db:migrate`. The Drizzle config switches between Turso
   and a local sqlite/libsql URL depending on `TURSO_AUTH_TOKEN`.

The `Deploy` GitHub Actions workflow already runs `bun run db:migrate`
before the worker deploy, so production migrations are wired up as soon
as the env secrets are populated.

## Deployment

- **CI**: `.github/workflows/deploy.yml` deploys on push to `main`;
  `.github/workflows/preview.yml` publishes a versioned Cloudflare alias
  per PR and comments the URL; `.github/workflows/validate.yml` runs a
  fork-safe `astro build` on every PR.
- **Worker**: `ncrmro-website-astro` (see `wrangler.jsonc`).
- **Live**: https://ncrmro-website-astro.ncrmro.workers.dev/

Required repo configuration:

- Secret `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit)
- Variable `CLOUDFLARE_ACCOUNT_ID`
- Environment `production` (used by `deploy.yml`)
- Optional secrets `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (only needed
  when the DB is revived)

## Credit

The Astro scaffold started from the
[Bear Blog](https://github.com/HermanMartinus/bearblog/) starter.
