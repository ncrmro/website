# Blog Post Sync

This script allows you to sync blog posts between your local Obsidian directory and the website database.

## Features

- **Download**: Export all blog posts from the database as Obsidian-compatible markdown files with YAML frontmatter
- **Push**: Sync local Obsidian markdown files to the database

## Usage

### Download Posts (Default)

Download all blog posts from the server as markdown files:

```bash
npm run sync-posts
```

Download to a specific directory:

```bash
npm run sync-posts -- -d ./my-obsidian-vault/posts
```

### Push Posts to Server

Push local markdown files to the server:

```bash
npm run sync-posts -- --push
```

Push from a specific directory:

```bash
npm run sync-posts -- -d ./my-obsidian-vault/posts --push
```

### Full Example

```bash
# Download posts to a specific directory
npm run sync-posts -- -d ./obsidian-vault/blog-posts

# Edit posts in Obsidian...

# Push changes back to server
npm run sync-posts -- -d ./obsidian-vault/blog-posts --push
```

## Authentication

For both download and push operations, you need to set the `AUTH_COOKIE` environment variable with your authentication cookie from the website.

To get your auth cookie:
1. Log into the website
2. Open browser developer tools (F12)
3. Go to Application/Storage tab > Cookies
4. Copy the session cookie value
5. Set it as an environment variable:

```bash
export AUTH_COOKIE="your-cookie-value"
```

## File Format

The script uses Obsidian-compatible markdown files with YAML frontmatter:

```markdown
---
title: "My Blog Post"
description: "A great post about something"
slug: "my-blog-post"
published: true
publish_date: "2024-01-15"
tags: ["tech", "programming"]
---

# My Blog Post

This is the content of my blog post in **markdown** format.

## Section

More content here...
```

## Options

- `-d, --directory <path>`: Local directory for blog posts (default: `./obsidian-posts`)
- `-p, --push`: Push local posts to server (default: download only)
- `-s, --server <url>`: Server URL (default: `http://localhost:3000`)
- `-h, --help`: Show help message

## File Structure

When downloading, posts are saved as:
```
obsidian-posts/
├── my-first-post.md
├── another-post.md
└── tech-tutorial.md
```

Each file contains:
- YAML frontmatter with post metadata
- Markdown content body

## How It Works

### Download Process
1. Authenticates with the server using your cookie
2. Fetches all posts via `/api/posts/sync` endpoint
3. Converts each post to Obsidian markdown format
4. Saves files to the specified directory

### Push Process
1. Reads all `.md` files from the specified directory
2. Parses YAML frontmatter and markdown content
3. Validates required fields (title, content)
4. Sends posts to server via `/api/posts/sync` endpoint
5. Creates new posts or updates existing ones based on slug

## Error Handling

- Invalid YAML frontmatter will cause files to be skipped
- Missing required fields (title) will skip the file
- Server errors are displayed with details
- Authentication failures will stop the process

## Notes

- Posts are matched by `slug` field for updates
- If no slug is provided, one is generated from the title
- Tags are automatically created if they don't exist
- The script preserves post IDs and timestamps when downloading