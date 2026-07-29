# CLAUDE.md

Guidance for Claude Code working in this repo.

@docs/architecture.md
@CONTRIBUTING.md

Both apply in full — architecture covers the stack, layout, content pipeline,
and deployment; CONTRIBUTING covers the dev shell, commands, and conventions.
Notes below are agent-specific.

## Working here

- Run every `bun` command from `code/web`, inside the devenv shell.
- Never edit a file in `docs/posts/` to fix content. It is a synced copy of
  `~/notes/publications/<date>-<slug>/index.mdx` in the notes vault and the
  next `sync-posts.sh` run will overwrite it. Change the vault file instead.
  Rendering and routing changes do belong here.
- Adding a component to a post is a two-repo change: the post stays portable
  (no imports, no `client:*`), so the component is injected by the route via
  `<Content components={{ … }} />` and any framework island needs an `.astro`
  wrapper here.
- Don't hand-edit `bun.lock`, and don't run `playwright install` — the dev
  shell supplies browsers.

## Last updated

2026-07-29 — architecture notes split into `docs/architecture.md`, development
instructions into `CONTRIBUTING.md`.
