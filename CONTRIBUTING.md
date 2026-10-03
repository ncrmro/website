# Contributing

Run tooling in the repository devenv shell, from `code/web`:

```sh
bun install --frozen-lockfile
bun run cf-typegen
bun run check
bun run build
```

`bun run dev` starts Astro; allocate a free port for the checkout before starting
servers. Use the shell-provided Playwright browsers; do not install another set.
Do not hand-edit `bun.lock`.

Post changes use `/admin` and Quiescent. Preserve UUIDs, slugs, historical dates,
original media bytes and draft visibility. The migration manifest and import
scripts verify the initial cutover. They are not an ongoing second content source.

Use Conventional Commits. Keep deployment separate from review and do not deploy
the full cutover until the checks in [quiescent-concept.md](docs/quiescent-concept.md)
pass. Production CI needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`;
repository access is the Worker secret `SERVICE_TOKEN`, never a committed value.
