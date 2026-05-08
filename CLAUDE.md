# Website Notes

## Architecture

- Framework: Next.js App Router (static export, `output: "export"`)
- Posts: MDX route files at `src/app/posts/<slug>/page.mdx`
- Resume content: `content/jobs/<slug>/index.md` (loader-based)
- Post media: Git LFS in `public/posts/<slug>/media/`, mirrored to R2

## Content model

- `src/content/types.ts` defines `PostDoc` and `JobDoc`
- `src/content/posts.ts` globs `src/app/posts/*/page.mdx` and parses
  frontmatter via gray-matter; powers listings and sitemap only —
  rendering is handled by Next's MDX integration directly
- `src/content/jobs.ts` reads `content/jobs/*/index.md` for `/resume`

## Public routes

- `/` shows published posts (listing)
- `/posts` lists all published posts
- `/posts/<slug>` is a static MDX page (no dynamic `[slug]` route)
- `/posts/{tech,travel,food}` are tag-filtered listings
- `/resume` renders job entries
- `src/app/sitemap.ts` generates the sitemap

## Commands

- `npm run dev`
- `npm run build`
- `npm run start` (serves `out/` after build)
- `npm run typecheck`
- `npm run e2e`
- `npm run sync:media` — uploads `public/posts/**/media` to R2

## Media + R2

- `.gitattributes` LFS-tracks `*.jpg`, `*.png`, `*.jpeg`, `*.gif`
- `npm run sync:media` mirrors `public/posts/<slug>/media/**` to the
  bucket configured by `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. Idempotent — re-runs are no-ops
  when sizes match
- Production builds set `NEXT_PUBLIC_R2_BASE=https://r2.ncrmro.com`
  so `PostImage` rewrites `/posts/<slug>/media/<file>` to the R2 URL
- Production CI sets `GIT_LFS_SKIP_SMUDGE=1` before checkout — R2 is
  the canonical source for media, so the build doesn't need LFS objects

## Constraints

- Do not reintroduce database-backed content
- Posts always live as MDX route files in `src/app/posts/<slug>/`
- Image refs in MDX use absolute paths `/posts/<slug>/media/<file>` so
  the same source works locally and against R2
