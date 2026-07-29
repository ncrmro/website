# ncrmro.com

Personal site and blog. Astro 6 on Cloudflare Workers —
https://ncrmro-website.ncrmro.workers.dev/

## Where posts live

`docs/posts/<YYYY-MM-DD-slug>.mdx`, at the repository root (the `posts`
symlink points there). The date prefix is stripped from the URL, so
`docs/posts/2026-07-29-my-post.mdx` serves at `/posts/my-post/`.

**These files are synced copies — don't edit them here.** The canonical source
of every post is the notes vault at
`~/notes/publications/<YYYY-MM-DD-slug>/index.mdx`. A local edit to
`docs/posts/` is overwritten by the next sync.

## How to make a post

In the vault (`~/notes`):

1. Create `publications/<YYYY-MM-DD-slug>/index.mdx` with frontmatter —
   `title` is required; `description`, `publish_date`, `tags`, and
   `published: false` are the usual rest.
2. Put any images in `publications/<YYYY-MM-DD-slug>/media/` and run
   `publications/sync-media.sh <YYYY-MM-DD-slug>` to upload them to R2.
   Reference them by absolute URL:
   `https://r2.ncrmro.com/posts/<slug>/media/<file>`.
3. Set `published: true` when it's ready to be public.
4. Run `publications/sync-posts.sh` (`--dry-run` first to preview). It copies
   the post into this repo, commits, and pushes to `main` — which deploys it.

Anything still `published: false` syncs with `draft: true`: it lands on the
site but is only visible at `/drafts/<slug>` behind the admin session, or
locally under `bun run dev`.

Posts carry no import statements and no client directives, so they stay
identical in both repos. To use a component in one, see
[docs/architecture.md](docs/architecture.md).

## More

- [docs/architecture.md](docs/architecture.md) — stack, layout, content
  pipeline, deployment
- [CONTRIBUTING.md](CONTRIBUTING.md) — dev shell, commands, conventions
