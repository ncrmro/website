# NCRMRO Website Helm Chart

This Helm chart deploys the NCRMRO website with automatic secret management for blog post synchronization.

## Deployment

### From GitHub Action

```shell
helm upgrade --install ncrmro-website ./chart --values chart/values.production.yaml
```

## Features

### Automatic Secret Generation

The chart automatically generates a `SYNC_AUTH_TOKEN` for blog post synchronization:

- **First install**: Generates a random 32-character token
- **Upgrades**: Reuses the existing token from the previous deployment
- **Custom token**: Override via `secrets.syncAuthToken` in values

### Secret Management

The generated secret:
- Persists across Helm upgrades (using `helm.sh/resource-policy: keep`)
- Is created before the main deployment (using Helm hooks)
- Can be manually overridden in values.yaml

## Configuration

### values.yaml

```yaml
secrets:
  # Blog post sync authentication token
  # If empty, a random token will be generated and persisted
  syncAuthToken: ""
```

### Environment Variables

The following environment variables are automatically configured:

- `SYNC_AUTH_TOKEN`: Token for blog post sync API authentication
- `DATABASE_PATH`: Path to SQLite database
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog analytics key

## Blog Post Sync

To use the blog post sync feature with the deployed application:

```bash
# Set the token (get it from the Kubernetes secret)
export AUTH_TOKEN=$(kubectl get secret ncrmro-website-secrets -o jsonpath='{.data.sync-auth-token}' | base64 -d)

# Download posts
npx ts-node bin/sync-posts.ts -s https://ncrmro.com

# Push posts  
npx ts-node bin/sync-posts.ts --push -s https://ncrmro.com
```