# Post bot prototype

This is a small GitHub-backed content workflow for creating, editing, and publishing blog posts through branches and pull requests.

It now has two entry points:

- UI/API on the Cloudflare Worker: `/admin/posts` and `/api/post-bot`
- Auth.js Google login, restricted to `ncrmro@gmail.com`
- Local CLI from `code/web`: `bun run post:bot ...`

The GitHub token stays in server-side environment/secrets. Do not commit this token.

## Token setup

Create a fine-grained GitHub PAT scoped only to `ncrmro/website`:

- Contents: read/write
- Pull requests: read/write
- Actions: read
- Metadata: read

For Cloudflare Worker testing, save it as a Worker secret:

```bash
wrangler secret put GITHUB_CONTENT_PAT
```

The UI/API uses Auth.js with Google OAuth. These should already exist in the Worker/GitHub secret setup, but the required names are:

```bash
wrangler secret put AUTH_SECRET
wrangler secret put AUTH_GOOGLE_ID
wrangler secret put AUTH_GOOGLE_SECRET
```

For branch preview OAuth, also set a redirect proxy URL so Google can call back to one stable authorized URI and Auth.js can redirect back to the preview URL encoded in state:

```bash
wrangler secret put AUTH_REDIRECT_PROXY_URL
# value: https://<stable-host>/api/auth
```

Then add this Google OAuth authorized redirect URI:

```text
https://<stable-host>/api/auth/callback/google
```

For a one-off preview without a proxy, add the exact preview callback URI instead:

```text
https://feat-post-bot-ncrmro-website.ncrmro.workers.dev/api/auth/callback/google
```

Only `ncrmro@gmail.com` can sign in.

Then open `/admin/posts`, sign in with Google, and create a post PR. The browser never receives `GITHUB_CONTENT_PAT`.

For local CLI use, export the token instead:

```bash
export GITHUB_CONTENT_PAT='github_pat_...'
```

Optional overrides:

```bash
export GITHUB_REPO='ncrmro/website'
export GITHUB_BASE_BRANCH='main'
```

## Worker API

Create a post PR:

```bash
curl -X POST https://<worker>/api/post-bot \
  -H 'content-type: application/json' \
  -H 'cookie: <Auth.js session cookie from ncrmro@gmail.com login>' \
  -d '{"action":"new","slug":"my-new-post","title":"My New Post","body":"Hello from the Worker UI."}'
```

Check preview status:

```bash
curl https://<worker>/api/post-bot?pr=123 \
  -H 'cookie: <Auth.js session cookie from ncrmro@gmail.com login>'
```

## CLI commands

Create a draft post branch and PR:

```bash
bun run post:bot new my-new-post \
  --title "My New Post" \
  --description "Short summary" \
  --tag notes \
  --body-file ./draft.mdx
```

Edit an existing post by replacing the full MDX file contents on a PR branch:

```bash
bun run post:bot edit my-existing-post --body-file ./updated-post.mdx
```

Publish through a PR by setting `published: true`:

```bash
bun run post:bot publish my-existing-post
```

Publish directly to `main` as an escape hatch:

```bash
bun run post:bot publish my-existing-post --direct
```

Check a PR's preview status and URL:

```bash
bun run post:bot status 123
```

The status command reads the existing Preview workflow comment marked with:

```html
<!-- gha-preview-deploy -->
```

## Flow

1. The bot creates or reuses `post/<slug>`.
2. It commits `code/web/src/content/blog/<slug>.mdx` through the GitHub Contents API.
3. It opens or reuses a PR into `main`.
4. The existing Preview workflow deploys to Cloudflare and comments the preview URL.
5. `bun run post:bot status <pr>` reports the PR, workflow runs, and preview URL.
