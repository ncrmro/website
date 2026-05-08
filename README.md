# ncrmro website

Static Next.js personal site. Posts are authored as MDX route files
and built into a fully static export.

## Content

- Posts: `src/app/posts/<slug>/page.mdx` (rendered by Next's MDX)
- Post media: `public/posts/<slug>/media/*` (Git LFS)
- Resume entries: `content/jobs/<slug>/index.md`

## Scripts

```bash
npm run dev
npm run build
npm run start          # serves out/ after build
npm run typecheck
npm run e2e
npm run sync:media     # upload public/posts/**/media to R2
```

## Media

`public/posts/**/media` is tracked in Git LFS (see `.gitattributes`)
and mirrored to a Cloudflare R2 bucket via `npm run sync:media`.

Run the sync script with these env vars exported:

```bash
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=ncrmro-website-uploads
npm run sync:media
```

## Production builds

Production sets:

```bash
GIT_LFS_SKIP_SMUDGE=1                            # CI checkout flag
NEXT_PUBLIC_R2_BASE=https://r2.ncrmro.com        # rewrite media URLs
```

`PostImage` rewrites `/posts/<slug>/media/<file>` to
`${NEXT_PUBLIC_R2_BASE}/posts/<slug>/media/<file>`, so the static
export references R2 directly and CI does not need LFS blobs.

## Notes

- No database, no auth, no dashboard, no runtime editor
- `public/` only holds static assets — canonical content lives under
  `src/app/posts` and `content/jobs`
