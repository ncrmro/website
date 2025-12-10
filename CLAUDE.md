# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Operations
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema changes directly (development)
- `npm run db:studio` - Open Drizzle Studio for database inspection

### Development Server
- `npm run dev` - Start development server with Turbopack (port 3000)
- `npm run build` - Build production application
- `npm run start` - Start production server

### Cloudflare Deployment
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run preview` - Build and preview locally with Cloudflare
- `npm run cf-typegen` - Generate Cloudflare environment types

### Testing & Quality
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run e2e` - Run Playwright end-to-end tests

### Utility Commands
- `npm run generate-password` - Build and run password generation CLI tool
- `npm run sync-posts` - Download posts from database as Obsidian markdown files
- `npm run sync-posts -- --push` - Push local Obsidian markdown files to database
- `npm run sync-posts -- -d <path>` - Specify custom directory for blog sync

## Architecture Overview

This is a Next.js 15 personal website/blog deployed on Cloudflare Workers, featuring:

### Core Technologies
- **Framework**: Next.js 15 with App Router, TypeScript, React 18
- **Database**: Turso (managed SQLite/libsql) with Drizzle ORM
- **Deployment**: Cloudflare Workers (via OpenNext)
- **Storage**: Cloudflare R2 for uploads
- **Styling**: Tailwind CSS with @tailwindcss/forms plugin
- **Content**: next-mdx-remote for MDX serialization, react-markdown for rendering
- **Testing**: Playwright for E2E testing
- **PWA**: next-pwa for progressive web app capabilities
- **Analytics**: Google Analytics, Umami Analytics, and PostHog

### Database Architecture
- Drizzle ORM with TypeScript schema definitions
- Turso (libsql) for production, local SQLite for development
- Schema files in `src/database/schema.*.ts`
- Migrations generated to `drizzle/` directory via Drizzle Kit
- Type-safe queries with auto-inferred TypeScript types
- Dual-mode database client (production Turso / local SQLite)

### Key Database Tables
- **users**: Authentication with scrypt password hashing, admin flag
- **sessions**: Session-based authentication with cookie storage
- **posts**: Blog posts with markdown body, slug, published flag, publish_date
- **tags**: Post categorization
- **posts_tags**: Many-to-many relationship between posts and tags
- **journal_entries**: One entry per user per day, Unix timestamps
- **journal_entry_history**: Immutable history tracking for journal edits

### Authentication System
- Custom session-based authentication using cookies
- Password hashing with scrypt and random salt (64-byte hash, 16-byte salt)
- Session stored in "viewer_session" cookie (HTTP-only)
- Timezone captured in "viewer_timezone" cookie
- Gravatar integration using MD5 hash of email
- Protected routes: `/dashboard/*` requires authentication
- Auth utilities: `selectSessionViewer()`, `selectViewer()` in src/lib/auth.ts

### Content Management
- **Posts**: Stored in database (NOT filesystem)
- Posts table includes: title, body (markdown), description, slug, published, publish_date
- Dashboard interface for creating/editing posts at `/dashboard/posts/`
- Rich editor with tabs: Write, Preview, Media
- LocalStorage auto-save during editing to prevent data loss
- MDX serialization server-side using next-mdx-remote
- Post categorization by tags
- Unpublished posts visible only to authenticated users

### File Upload System
- **Storage**: Cloudflare R2 bucket for media uploads
- **Public domain**: r2.ncrmro.com
- **Production**: Uses R2 native binding via `getCloudflareContext()`
- **Development**: Falls back to S3-compatible API with credentials
- **Upload path**: `uploads/posts/{postId}/{filename}`
- **API endpoint**: `/api/posts/uploads/`

### Blog Post Sync Feature
- CLI tool: `bin/sync-posts.ts` compiled to JavaScript
- **Download**: Export database posts as Obsidian markdown with YAML frontmatter
- **Push**: Sync local markdown files back to database
- Authentication via `AUTH_TOKEN` environment variable (client) and `SYNC_AUTH_TOKEN` (server)
- Supports custom directory via `-d` flag
- Posts matched by slug for updates

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
  - `src/app/posts/[slug]/page.tsx` - Individual blog post view
  - `src/app/dashboard/posts/` - Post CRUD interface
  - `src/app/dashboard/journal/` - Journal entry interface
  - `src/app/login/` - Authentication page
  - `src/app/api/posts/uploads/` - R2 upload API
- `src/components/` - Reusable React components
- `src/database/` - Drizzle ORM schema and connection
  - `src/database/index.ts` - Database client setup
  - `src/database/schema.ts` - Schema re-exports
  - `src/database/schema.users.ts` - Users and sessions tables
  - `src/database/schema.posts.ts` - Posts, tags, and posts_tags tables
  - `src/database/schema.journal.ts` - Journal entries and history tables
- `src/lib/` - Core utilities (auth, R2)
  - `src/lib/auth.ts` - Authentication and session logic
  - `src/lib/r2/upload.ts` - R2 upload utilities
- `src/models/` - Database query functions
- `drizzle/` - Generated SQL migrations
- `bin/` - CLI tools
  - `bin/sync-posts.ts` - Blog post sync with Obsidian
  - `bin/generate-password.ts` - Password generation utility
- `tests/` - Playwright E2E tests
- `public/` - Static assets

### Configuration Files
- `wrangler.jsonc` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext configuration for Cloudflare
- `drizzle.config.ts` - Drizzle ORM configuration

### Development Workflow
1. Start dev server: `npm run dev`
2. Database inspection: `npm run db:studio` (opens Drizzle Studio)
3. Making schema changes:
   - Modify TypeScript schema in `src/database/schema.*.ts`
   - Run `npm run db:generate` to create migration
   - Run `npm run db:migrate` to apply migration
4. Testing: `npm run e2e` for Playwright tests

### Deployment
- **Platform**: Cloudflare Workers (serverless edge)
- **Compiler**: OpenNext (@opennextjs/cloudflare) compiles Next.js for Workers
- **Database**: Turso (managed libsql) in AWS us-east-2
- **Storage**: Cloudflare R2 bucket (`ncrmro-website-uploads`)
- **CI/CD**:
  - GitHub Actions (`.github/workflows/deploy-cloudflare.yml`) only runs database migrations on push to main
  - Cloudflare Pages automatically builds and deploys the Worker (connected to GitHub repo)
- **Configuration**: `wrangler.jsonc` defines bindings and environment

### Environment Variables

**Production (Cloudflare Workers):**
- `TURSO_DATABASE_URL` - Turso database connection URL
- `TURSO_AUTH_TOKEN` - Turso authentication token (secret)
- `NEXT_PUBLIC_R2_DOMAIN` - Public R2 domain for uploads (r2.ncrmro.com)
- `SYNC_AUTH_TOKEN` - Server-side auth token for blog sync API

**Development:**
- `DATABASE_URL` or `DB_PORT` - Local SQLite/libsql connection
- `R2_ACCOUNT_ID` - Cloudflare account ID for R2
- `R2_ACCESS_KEY_ID` - R2 S3-compatible access key
- `R2_SECRET_ACCESS_KEY` - R2 S3-compatible secret key
- `R2_BUCKET_NAME` - R2 bucket name

**General:**
- `WEB_PORT` - Web server port (default: 3000)
- `NODE_ENV` - Environment mode (analytics only load in production)
- `CONTACT_INFO_JSON` - Contact information configuration
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `GOOGLE_ANALYTICS_TRACKING_ID` - Google Analytics tracking ID
- `AUTH_TOKEN` - Client-side auth token for blog sync CLI

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Enables clean imports: `@/lib/auth`, `@/components/Navbar`
- Strict mode enabled
- Target: ES2015, module: ESNext

### Special Features
- **R2 Storage**: Media uploads stored in Cloudflare R2 with public access via r2.ncrmro.com
- **PWA**: Service worker registration via next-pwa, manifest at `/public/manifest.json`
- **Analytics Stack**: Google Analytics, Umami (self-hosted), PostHog with proxy rewrites
- **Server Components**: Most pages use React Server Components by default
- **Server Actions**: Form submissions use Next.js Server Actions
- **Edge Deployment**: Runs on Cloudflare Workers at the edge for low latency
