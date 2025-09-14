# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Operations
- `npm run build-migrations` - Build TypeScript migrations from src/lib/migrations.ts
- `npm run mig` - Run migrations and seed data, then generate Kysely types
- `npm run typegen` - Generate Kysely types from database schema
- `npm run db` - Open litecli database browser for SQLite database

### Development Server
- `npm run dev` - Start development server (builds migrations, runs migrations, starts Next.js dev server on port 3000)
- `npm run build` - Build production application
- `npm run start` - Start production server from standalone build

### Testing & Quality
- `npm run lint` - Run ESLint
- `npm run e2e` - Run Playwright end-to-end tests
- `npm test` - Not defined, use `npm run e2e` for tests

### Utility Commands
- `npm run generate-password` - Build and run password generation CLI tool

## Architecture Overview

This is a Next.js 15 personal website/blog with the App Router architecture, featuring:

### Core Technologies
- **Framework**: Next.js 15 with App Router, TypeScript, React 18
- **Database**: SQLite with Kysely query builder and better-sqlite3
- **Styling**: Tailwind CSS with @tailwindcss/forms plugin
- **Testing**: Playwright for E2E testing
- **PWA**: next-pwa for progressive web app capabilities
- **Analytics**: Google Analytics, Umami Analytics, and PostHog

### Database Architecture
- SQLite database with WAL mode enabled
- Custom functions: `regexp()`, `uuid()`, `slugify()`
- Migration system in `database/migrations/` with seed data
- Kysely ORM with auto-generated types via kysely-codegen
- Database path: `DATABASE_PATH` env var or `./database/sqlite3.db`

### Authentication System
- Custom session-based authentication using cookies
- Password hashing with scrypt and salt
- Session management with database-stored sessions
- Gravatar integration for user avatars

### Content Management
- **Posts**: Stored in SQLite database with markdown body content
- Posts table includes: title, body (markdown), description, slug, published status, publish_date
- Tagging system with many-to-many posts_tags relationship
- Automatic slug generation from title using custom SQLite function
- Dashboard interface for creating/editing posts at `/dashboard/posts/`
- Posts categorized by tags (tech, travel, food) rather than filesystem structure

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Core utilities (database, auth, migrations)
- `database/` - SQLite database, migrations, and seeds
- `public/posts/` - Legacy markdown files (now stored in database)
- `tests/` - Playwright E2E tests
- `chart/` - Kubernetes Helm chart for deployment

### Development Notes
- Uses standalone output for Docker deployment
- Configured with PostHog proxy rewrites for analytics
- PWA configured with service worker registration
- Supports typed routes and server actions
- Database migrations run automatically in development
- Path aliases: `@/*` maps to `./src/*`
- Journal entries also stored in database (separate from posts)

### Environment Variables
- `DATABASE_PATH` - SQLite database file path
- `CONTACT_INFO_JSON` - Contact information configuration
- `NODE_ENV` - Environment mode (production analytics only load in production)

## Deployment
- Containerized with Docker
- Kubernetes deployment via Helm chart in `chart/` directory
- Production builds use standalone output mode