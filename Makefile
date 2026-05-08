.PHONY: dev build start lint typecheck e2e migrate-content

# Start only Next.js dev server
dev:
	npm run dev

# Build static site output
build:
	npm run build

# Serve static output
start:
	npm run start

# Run linter
lint:
	npm run lint

# Run type checking
typecheck:
	npm run typecheck

# Run Playwright e2e tests
e2e:
	npm run e2e

migrate-content:
	npm run migrate:content
