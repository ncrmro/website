# Migration Tasks: Cloudflare Workers Deployment

This document tracks the remaining tasks to complete the migration from Kubernetes/SQLite to Cloudflare Workers/Turso/R2.

## Prerequisites

- [ ] Cloudflare account with Workers enabled
- [ ] Turso account (https://turso.tech)
- [ ] GitHub repository secrets access

---

## 1. Turso Database Setup [COMPLETED]

### Create Database [DONE]
```bash
# Database created: ncrmro-website-production
turso db show ncrmro-website-production --url
# libsql://ncrmro-website-production-ncrmro.aws-us-east-2.turso.io
```

### Schema Pushed [DONE]
```bash
npm run db:push
# Schema pushed via Drizzle Kit
```

### Data Migrated [DONE]
```bash
# Copied SQLite from Kubernetes pod
KUBECONFIG=~/.kube/config.ocean.yml kubectl cp \
  ncrmro-website-prod/ncrmro-website-ncrmro-com-5b96f9d8f7-hjjv7:/database/sqlite3.db \
  /tmp/website-sqlite3.db

# Extracted and imported data
sqlite3 /tmp/website-sqlite3.db ".dump" > /tmp/website-dump.sql
grep "^INSERT INTO" /tmp/website-dump.sql | \
  grep -v "INSERT INTO migrations" | \
  grep -v "INSERT INTO sessions" > /tmp/website-data-clean.sql
cat /tmp/website-data-clean.sql | turso db shell ncrmro-website-production

# Verified: 1 user, 42 posts, 24 tags, 56 posts_tags, 43 journal entries
```

---

## 2. Cloudflare R2 Setup [PARTIALLY COMPLETE]

### Create R2 Bucket [DONE]
```bash
npx wrangler r2 bucket create ncrmro-website-uploads
# ✅ Created bucket 'ncrmro-website-uploads'
```

### Migrate Existing Uploads [DONE]
```bash
# Copied from Kubernetes
KUBECONFIG=~/.kube/config.ocean.yml kubectl cp \
  ncrmro-website-prod/ncrmro-website-ncrmro-com-5b96f9d8f7-hjjv7:/app/public/uploads \
  /tmp/website-uploads

# Uploaded 46 files (114MB) to R2
bash /tmp/upload-to-r2.sh
# All files uploaded to uploads/ prefix
```

### Set Up Custom Domain [TODO]
1. Go to Cloudflare Dashboard → R2 → ncrmro-website-uploads
2. Settings → Public access → Custom domain
3. Add domain: `r2.ncrmro.com`
4. DNS will be configured automatically

### Environment Variables for Local Development
```bash
# Add to .env.local (for local dev with S3 API)
NEXT_PUBLIC_R2_DOMAIN=r2.ncrmro.com
R2_ACCOUNT_ID=cd7618208c116e5b6947e6cc0d02b53f
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET_NAME=ncrmro-website-uploads
```

---

## 3. GitHub Secrets Configuration

Add these secrets to GitHub repository (Settings → Secrets → Actions):

| Secret Name | Description |
|-------------|-------------|
| `TURSO_DATABASE_URL` | Turso database URL (libsql://...) |
| `TURSO_AUTH_TOKEN` | Turso authentication token |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers/R2 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `SYNC_AUTH_TOKEN` | Auth token for blog sync API |

### Create Cloudflare API Token
1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create token with permissions:
   - Account: Cloudflare Workers - Edit
   - Account: Cloudflare R2 - Edit
   - Zone: DNS - Edit (if using custom domains)

---

## 4. Wrangler Configuration

### Verify wrangler.jsonc
```jsonc
{
  "name": "ncrmro-website",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "r2_buckets": [
    {
      "binding": "UPLOADS",
      "bucket_name": "ncrmro-website-uploads"
    }
  ]
}
```

### Test Locally with Wrangler
```bash
# Preview the worker locally
npm run preview

# Or manually
npx opennextjs-cloudflare build
npx wrangler dev
```

---

## 5. Deploy to Cloudflare

### Manual Deployment
```bash
# Build and deploy
npm run deploy

# Or step by step
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

### Automatic Deployment (GitHub Actions)
1. Push to `main` branch triggers `.github/workflows/deploy-cloudflare.yml`
2. Workflow runs migrations, uploads secrets, builds, and deploys

### Set Worker Secrets (First Time)
```bash
# These are set automatically by GitHub Actions, but can be done manually
echo "<token>" | npx wrangler secret put TURSO_AUTH_TOKEN
echo "<url>" | npx wrangler secret put TURSO_DATABASE_URL
echo "<token>" | npx wrangler secret put SYNC_AUTH_TOKEN
```

---

## 6. DNS Configuration

### Option A: Cloudflare Workers Route
1. Add domain to Cloudflare
2. In Workers → your worker → Triggers → Add Custom Domain
3. Enter your domain (e.g., `ncrmro.com`)

### Option B: Workers.dev Subdomain
- Worker is available at `ncrmro-website.<account>.workers.dev`

---

## 7. Post-Deployment Verification

- [ ] Website loads correctly
- [ ] Authentication works (login/logout)
- [ ] Blog posts display correctly
- [ ] Post creation/editing works
- [ ] Image uploads work (R2)
- [ ] Journal entries work
- [ ] Blog sync API works (`/api/posts/sync`)

---

## 8. Cleanup (After Verification)

- [ ] Shut down Kubernetes deployment
- [ ] Delete old PersistentVolumeClaims
- [ ] Remove old GitHub Actions workflow (already archived)
- [ ] Update DNS if using different domain config
- [ ] Delete `_archived/` directory (optional, keep for reference)

---

## Environment Variables Reference

### Production (Cloudflare Workers)
Set via `wrangler secret put` or GitHub Actions:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `SYNC_AUTH_TOKEN`

### Local Development (.env.local)
```bash
# Database (local Turso or libsql server)
TURSO_DATABASE_URL=http://localhost:8080
# Or use Turso directly:
# TURSO_DATABASE_URL=libsql://ncrmro-website-<account>.turso.io
# TURSO_AUTH_TOKEN=<token>

# R2 (S3-compatible API for local dev)
NEXT_PUBLIC_R2_DOMAIN=r2.ncrmro.com
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET_NAME=ncrmro-website-uploads

# Sync API
SYNC_AUTH_TOKEN=<dev-token>
```

---

## Troubleshooting

### Build Fails
- Check Next.js version compatibility with OpenNext
- Ensure all dependencies are installed: `npm ci`

### Database Connection Errors
- Verify `TURSO_DATABASE_URL` format: `libsql://...`
- Check auth token is valid: `turso db tokens list`

### R2 Upload Errors
- In production: Check R2 bucket binding in wrangler.jsonc
- In development: Verify S3 credentials and bucket name

### Worker Deployment Fails
- Check Cloudflare API token permissions
- Verify account ID is correct
- Run `npx wrangler whoami` to check authentication
