# Database & Auth Migration Guide

This document outlines the major refactoring from Kysely + session-based auth to Drizzle ORM + NextAuth (Auth.js v5).

## What Changed

### Database Layer

**Before (Kysely + better-sqlite3):**
- `src/lib/database.ts` - Kysely instance
- `kysely-codegen` for type generation
- Custom migration system in `src/lib/migrations.ts`

**After (Drizzle ORM + better-sqlite3):**
- `src/lib/db/index.ts` - Drizzle instance with better-sqlite3
- `src/lib/db/schema.ts` - Centralized schema exports
- `src/lib/db/schema.auth.ts` - Auth.js compatible tables
- `src/lib/db/schema.blog.ts` - Blog tables (posts, tags, posts_tags)
- `src/lib/db/schema.journal.ts` - Journal tables
- `drizzle-kit` for migrations and schema management

### Authentication

**Before (Custom Session-based):**
- `src/lib/auth.ts` - Custom session management with scrypt passwords
- Session cookies (`viewer_session`)
- Manual session table management

**After (NextAuth v5 - Auth.js):**
- `src/app/auth.ts` - NextAuth configuration
- `src/lib/auth.config.ts` - Edge-safe auth config
- `src/types/next-auth.d.ts` - TypeScript type extensions
- **Pure JWT strategy** (no database sessions)
- Google OAuth for production
- Credentials provider for development (password-based)
- Auto-registration for OAuth users

### Key Changes

1. **User ID Type**: Changed from `string` (UUID) to `integer` (auto-increment)
2. **Session Strategy**: Session-based → JWT-based
3. **OAuth Support**: Added Google OAuth integration
4. **Schema Changes**:
   - Users table now compatible with Auth.js
   - Added `accounts` table for OAuth
   - Simplified sessions table (kept for compatibility)
   - Posts/tags/journal tables remain similar but use integer IDs

## Migration Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and set required variables:

```bash
# Required
AUTH_SECRET=  # Generate with: openssl rand -base64 32

# Optional - For Google OAuth in production
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

### 3. Generate Database Schema

```bash
npm run db:generate
```

This creates SQL migration files in `drizzle/` directory.

### 4. Run Migrations

```bash
npm run db:migrate
```

This applies migrations to the database (uses `:memory:` by default).

### 5. Seed Development Data

```bash
npm run db:seed
```

This creates:
- Test users (admin@example.com, bob@alice.com)
- Sample blog posts with tags
- Test data for development

## Database Configuration

### In-Memory Mode (Default)

```bash
DATABASE_PATH=:memory:
```

Perfect for development and testing. Data resets on server restart.

### Persistent Mode

```bash
DATABASE_PATH=./database/sqlite3.db
```

Data persists between restarts.

## Development Workflow

### Starting the Dev Server

```bash
npm run dev
```

This automatically:
1. Runs migrations
2. Starts Next.js dev server on port 3000

### Development Login

In development mode, use these credentials:

- **Admin**: Password "admin" (or "admin-123", "admin-xyz", etc.)
- **User**: Password "password" (or "password-123", etc.)

The suffix is ignored - any string matching `password-*` or `admin-*` works.

### Working with the Database

```bash
# Open database browser (litecli)
npm run db

# Generate new migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly to database (dev only)
npm run db:push

# Open Drizzle Studio (GUI)
npm run db:studio
```

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 Client ID credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)

### 2. Configure Environment

```bash
AUTH_GOOGLE_ID=your_client_id_here
AUTH_GOOGLE_SECRET=your_client_secret_here
```

## API Changes

### Authentication

**Before:**
```typescript
import { selectViewer } from '@/lib/auth';

const viewer = await selectViewer();
if (!viewer) redirect('/login');
```

**After:**
```typescript
import { auth } from '@/app/auth';

const session = await auth();
if (!session?.user) redirect('/login');
```

### Database Queries

**Before (Kysely):**
```typescript
import { db } from '@/lib/database';

const posts = await db
  .selectFrom('posts')
  .select(['id', 'title', 'slug'])
  .where('published', '=', true)
  .execute();
```

**After (Drizzle):**
```typescript
import { db, posts } from '@/lib/db';
import { eq } from 'drizzle-orm';

const publishedPosts = await db
  .select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
  })
  .from(posts)
  .where(eq(posts.published, true));
```

## Files Requiring Migration

The following files still need refactoring from Kysely to Drizzle:

### Critical Path
- [x] `src/lib/auth.ts` - Refactored (removed session management)
- [x] `src/models/posts.ts` - Refactored to Drizzle
- [x] `src/app/login/page.tsx` - Refactored for NextAuth
- [ ] `src/app/dashboard/posts/new/page.tsx`
- [ ] `src/app/dashboard/posts/[slug]/page.tsx`
- [ ] `src/app/dashboard/journal/page.tsx`

### Read-Only Pages
- [ ] `src/app/posts/[slug]/page.tsx`
- [ ] `src/app/posts/Posts.tsx`
- [ ] `src/app/posts/travel/page.tsx`

### API Routes
- [ ] `src/app/api/posts/sync/route.ts`
- [ ] `src/app/api/posts/uploads/route.ts`
- [ ] `src/app/sitemap.xml/route.ts`

### Utilities
- [ ] `src/lib/migrations.ts` - Can be removed (replaced by Drizzle migrations)

## Fixtures

Sample blog posts are now in `fixtures/blog-posts.ts`:

- 5 published posts covering tech, travel, food, photography
- 1 draft post
- Pre-configured tags
- Post-tag relationships

These are loaded by `npm run db:seed`.

## Custom SQL Functions

The following custom SQLite functions are preserved:

- `regexp(pattern, text)` - Regular expression matching
- `uuid()` - Generate UUIDs
- `slugify(text)` - Convert text to URL-safe slugs

These are registered in `src/lib/db/index.ts`.

## Type Safety

Drizzle provides full type safety:

```typescript
import { Post, NewPost, User } from '@/lib/db/schema';

// Inferred from schema
const post: Post = await db.select().from(posts).where(...);

// For inserts
const newPost: NewPost = {
  title: 'New Post',
  body: 'Content',
  slug: 'new-post',
  description: 'Description',
  userId: 1,
};
```

## Troubleshooting

### "Cannot find module '@/lib/database'"

Update imports from `@/lib/database` to `@/lib/db`.

### "executeTakeFirst is not a function"

This is Kysely syntax. Use Drizzle syntax instead:

```typescript
// Kysely
const [post] = await db.selectFrom('posts').executeTakeFirst();

// Drizzle
const [post] = await db.select().from(posts).limit(1);
```

### JWT Decode Errors

Ensure `AUTH_SECRET` is set in `.env`. Generate with:

```bash
openssl rand -base64 32
```

### Type Errors with Session

Import the extended types:

```typescript
import type { Session } from 'next-auth';

// Session includes custom fields: user.id, user.admin
const session: Session = await auth();
console.log(session.user.admin); // ✅ Type-safe
```

## Next Steps

1. Complete refactoring of remaining dashboard pages
2. Update API routes to use Drizzle
3. Add comprehensive tests
4. Update deployment configuration
5. Migrate production database

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [NextAuth.js v5 Docs](https://authjs.dev/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Drizzle with better-sqlite3](https://orm.drizzle.team/docs/get-started-sqlite#better-sqlite3)
