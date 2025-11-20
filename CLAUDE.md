# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Operations
- `npm run build-migrations` - Build TypeScript migrations from src/lib/migrations.ts
- `npm run mig` - Run migrations and seed data
- `npm run db` - Open litecli database browser for SQLite database
- `npm run drizzle:generate` - Generate Drizzle migrations from schema
- `npm run drizzle:push` - Push schema changes to database
- `npm run drizzle:studio` - Open Drizzle Studio for database browsing

### Development Server
- `npm run dev` - Start development server (builds migrations, runs migrations, starts Next.js dev server on port 3000)
- `npm run build` - Build production application
- `npm run start` - Start production server from standalone build

### Testing & Quality
- `npm run lint` - Run ESLint
- `npm run e2e` - Run Playwright end-to-end tests

### Utility Commands
- `npm run generate-password` - Build and run password generation CLI tool
- `npm run sync-posts` - Download posts from database as Obsidian markdown files
- `npm run sync-posts -- --push` - Push local Obsidian markdown files to database
- `npm run sync-posts -- -d <path>` - Specify custom directory for blog sync

## Architecture Overview

This is a Next.js 15 personal website/blog with the App Router architecture, featuring:

### Core Technologies
- **Framework**: Next.js 15 with App Router, TypeScript, React 18
- **Database**: SQLite with Drizzle ORM and better-sqlite3
- **Styling**: Tailwind CSS with @tailwindcss/forms plugin
- **Content**: next-mdx-remote for MDX serialization, react-markdown for rendering
- **Testing**: Playwright for E2E testing
- **PWA**: next-pwa for progressive web app capabilities
- **Analytics**: Google Analytics, Umami Analytics, and PostHog

### Database Architecture
- SQLite database with WAL mode enabled
- Custom SQL functions: `regexp()`, `uuid()`, `slugify()`
- Migration system in `database/migrations/` with seed data
- Drizzle ORM with schema defined in `src/lib/schema.ts`
- Type-safe database queries with Drizzle's query builder
- Database path: `DATABASE_PATH` env var or `./database/sqlite3.db`
- All tables use STRICT mode + WITHOUT ROWID for performance (defined in migrations)
- Automatic timestamp triggers on all tables

### Key Database Tables
- **users**: Authentication with scrypt password hashing, admin flag, Gravatar integration
- **sessions**: Session-based authentication with cookie storage
- **posts**: Blog posts with markdown body, slug auto-generation, published flag (boolean), publish_date
- **tags**: Post categorization (tech, travel, food, etc.)
- **posts_tags**: Many-to-many relationship between posts and tags
- **journal_entries**: One entry per user per day, Unix timestamps
- **journal_entry_history**: Immutable history tracking for all journal edits

### Authentication System
- Custom session-based authentication using cookies
- Password hashing with scrypt and random salt (64-byte hash, 16-byte salt)
- Session stored in "viewer_session" cookie (HTTP-only)
- Timezone captured in "viewer_timezone" cookie
- Gravatar integration using MD5 hash of email
- Protected routes: `/dashboard/*` requires authentication
- Auth utilities: `selectSessionViewer()`, `selectViewer()` in src/lib/auth.ts

### Content Management
- **Posts**: Stored in SQLite database (NOT filesystem)
- Posts table includes: title, body (markdown), description, slug, published (boolean), publish_date
- Automatic slug generation from title using custom SQLite `slugify()` function
- Dashboard interface for creating/editing posts at `/dashboard/posts/`
- Rich editor with tabs: Write, Preview, Media
- LocalStorage auto-save during editing to prevent data loss
- MDX serialization server-side using next-mdx-remote
- Post categorization by tags rather than filesystem structure
- Unpublished posts visible only to authenticated users

### Blog Post Sync Feature
- CLI tool: `bin/sync-posts.ts` compiled to JavaScript
- **Download**: Export database posts as Obsidian markdown with YAML frontmatter
- **Push**: Sync local markdown files back to database
- Authentication via `AUTH_TOKEN` environment variable (client) and `SYNC_AUTH_TOKEN` (server)
- Supports custom directory via `-d` flag
- Posts matched by slug for updates
- See BLOG_SYNC.md for detailed usage

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
  - `src/app/posts/[slug]/page.tsx` - Individual blog post view
  - `src/app/dashboard/posts/` - Post CRUD interface
  - `src/app/dashboard/journal/` - Journal entry interface
  - `src/app/login/` - Authentication page
- `src/components/` - Reusable React components
- `src/lib/` - Core utilities (database, auth, migrations)
  - `src/lib/database.ts` - Kysely setup, custom SQL functions (regexp, uuid, slugify)
  - `src/lib/auth.ts` - Authentication and session logic
  - `src/lib/migrations.ts` - Database migration runner
- `database/` - SQLite database, migrations, and seeds
  - `database/migrations/` - SQL migration files (numbered 0000-*, 0001-*, etc.)
  - `database/seeds/` - SQL seed files for development data
  - `database/dist/` - Compiled migrations (build artifact)
- `bin/` - CLI tools
  - `bin/sync-posts.ts` - Blog post sync with Obsidian
  - `bin/generate-password.ts` - Password generation utility
- `tests/` - Playwright E2E tests
- `public/` - Static assets
  - `public/uploads/` - User-uploaded media (mounted as Kubernetes PVC in production)
  - `public/posts/` - Legacy markdown files (posts now in database)
- `chart/` - Kubernetes Helm chart for deployment

### Development Workflow
1. Start dev server: `npm run dev` (builds migrations, runs them, starts Next.js)
2. Database inspection: `npm run db` (opens litecli SQL browser)
3. Making schema changes:
   - Add SQL to `database/migrations/XXXX-name.sql`
   - Run `npm run mig` to apply migrations and regenerate Kysely types
4. Testing: `npm run e2e` for Playwright tests

### Deployment
- **Container**: Multi-stage Dockerfile with standalone Next.js output
- **Kubernetes**: Helm chart in `chart/` directory
  - Deployment with configurable replicas (default: 2)
  - PersistentVolumeClaim for database (`/database/sqlite3.db`)
  - PersistentVolumeClaim for uploads (`/app/public/uploads`)
  - Pre-deployment Job for running migrations
  - Ingress for HTTPS routing
  - Secret for `SYNC_AUTH_TOKEN` (auto-generated if empty)
- **CI/CD**: GitHub Actions workflow (`.github/workflows/build-and-release.yml`)
  - Multi-stage build and push to GitHub Container Registry
  - Trivy security scanning
  - Helm deployment via Tailscale VPN to private cluster

### Environment Variables
- `DATABASE_PATH` - SQLite database file path (default: `./database/sqlite3.db`)
- `WEB_PORT` - Web server port (default: 3000)
- `NODE_ENV` - Environment mode (analytics only load in production)
- `CONTACT_INFO_JSON` - Contact information configuration
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `GOOGLE_ANALYTICS_TRACKING_ID` - Google Analytics tracking ID
- `SYNC_AUTH_TOKEN` - Server-side auth token for blog sync API
- `AUTH_TOKEN` - Client-side auth token for blog sync CLI

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Enables clean imports: `@/lib/auth`, `@/components/Navbar`
- Strict mode enabled
- Target: ES2015, module: ESNext

### Special Features
- **Custom SQLite Functions**:
  - `regexp(regex, text)` - Full regex support in SQL queries
  - `uuid()` - Generate UUIDs in database
  - `slugify(text)` - Convert titles to URL-safe slugs
- **PWA**: Service worker registration via next-pwa, manifest at `/public/manifest.json`
- **Analytics Stack**: Google Analytics, Umami (self-hosted), PostHog with proxy rewrites
- **Server Components**: Most pages use React Server Components by default
- **Server Actions**: Form submissions use Next.js Server Actions
- **Image Optimization**: Sharp for image processing
