# E2E Tests with Playwright

This directory contains end-to-end tests for the website using Playwright.

## Prerequisites

### Database Setup

The tests require a local libsql/SQLite database server running on `http://localhost:8080`.

#### Option 1: Using sqld (Official libSQL Server)

If you have sqld installed locally (via Turso CLI or standalone binary):

```bash
sqld --db-path ./local.db --http-listen-addr 127.0.0.1:8080
```

#### Option 2: Using the Makefile

The project includes a Makefile with database commands:

```bash
make db    # Start only the database server
make up    # Start both database and dev server together
```

### Install Playwright

```bash
npx playwright install
```

## Running Tests

### Run all tests:
```bash
npm run e2e
```

### Run specific test file:
```bash
npx playwright test tests/posts.spec.ts
```

### Run tests with UI mode:
```bash
npx playwright test --ui
```

### Run tests in debug mode:
```bash
npx playwright test --debug
```

## Test Structure

### Fixtures

- **db**: Kysely database instance for direct database access
- **viewer**: Authenticated user with session cookies automatically set

### Post Tests (`posts.spec.ts`)

Tests for post creation, editing, and saving functionality:

1. **Create posts** - Tests creating a new post with required fields
2. **Edit post body** - Tests editing post content from the post view page
3. **Edit post slug** - Tests changing a post's slug and URL redirection
4. **Draft posts visibility** - Tests that draft posts are not accessible to anonymous users
5. **Publish posts** - Tests publishing a draft post
6. **Set post date** - Tests setting a publish date on a post
7. **Save new post with required fields** - Tests the complete save workflow for new posts with validation
8. **Save existing post shows success feedback** - Tests saving changes to an existing post and verifies UI feedback
9. **Save post validates required fields** - Tests form validation when required fields are missing
10. **Save post with all metadata fields** - Tests saving a post with all metadata fields filled

## Test Database

- Tests use a local SQLite database file (`local.db`)
- Database schema is automatically created via Drizzle `db:push`
- Each test uses fixtures to create isolated test users and data
- Cleanup happens automatically after each test

## CI/CD

In CI environments, the tests run with:
- Increased timeouts (30 seconds vs 10 seconds locally)
- Test retries enabled (2 retries on failure)
- Sequential execution (no parallel workers)
- Web server automatically started before tests

## Troubleshooting

### "ECONNREFUSED" or "Server returned HTTP status 404"

The database server is not running. Start it with:
```bash
sqld --db-path ./local.db --http-listen-addr 127.0.0.1:8080
```

### "MODULE_NOT_FOUND" errors

Install dependencies:
```bash
npm install
```

### Browser not found

Install Playwright browsers:
```bash
npx playwright install
```
