#syntax=docker/dockerfile:1.4
FROM node:19-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
#RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# We are stuck on node 19 as nextjs doesn't work well on 20 yet,
# better-sqlite3 doesn't have a prebuilt binary in node 19 and needs python
RUN apk add --no-cache python3 build-base && \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY  . .

# Add build argument for PostHog key
ARG NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# We run migrations here so that we can run kysely-codegen
RUN yarn build-migrations && node database/dist/migrations.js && yarn typegen && yarn build


# Production image, copy all the files and run next
FROM base AS runner

# Better better sqlite support, about 57mb.
RUN \
   apk add --no-cache python3 py3-pip; \
   pip install --no-cache-dir litecli; \
   apk del py3-pip

WORKDIR /app

ENV NODE_ENV=production PORT=3000 HOSTNAME=localhost
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  addgroup --system --gid 10001 nodejs; \
  adduser --system --uid 10001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=10001:10001 /app/database ./database

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing

COPY --from=builder --chown=10001:10001 /app/.next/standalone ./
# nextjs trace doesn't copy the kysely dependency which is needed during migrations
COPY --from=builder --chown=10001:10001 /app/node_modules/kysely ./node_modules/kysely
COPY --from=builder --chown=10001:10001 /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]