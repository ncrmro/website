.PHONY: up dev db db-studio lint typecheck e2e

# Start libsql and Next.js dev server together
up:
	concurrently --names "db,web" --prefix-colors "blue,green" \
		"sqld --db-path ./local.db --http-listen-addr 127.0.0.1:8080" \
		"npm run dev"

# Start only Next.js dev server
dev:
	npm run dev

# Start only libsql database
db:
	sqld --db-path ./local.db --http-listen-addr 127.0.0.1:8080

# Open Drizzle Studio
db-studio:
	npm run db:studio

# Run linter
lint:
	npm run lint

# Run type checking
typecheck:
	npm run typecheck

# Run Playwright e2e tests
e2e:
	npm run e2e
