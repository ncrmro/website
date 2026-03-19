# Static Blog Requirements

This document uses the key words "MUST", "MUST NOT", "REQUIRED", "SHALL",
"SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL"
as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Overview

This site is a personal blog that MUST be fully static. All content is served
from MDX files on the filesystem. There is no database, authentication, or
server-side backend required to render pages.

## Content Storage

1. Blog posts MUST be stored as Markdown files in the `public/posts/` directory.
2. A post MUST contain a YAML frontmatter block delimited by `---` at the top of
   the file.
3. A post MUST include a `title` field in its frontmatter.
4. A post MUST include a `description` field in its frontmatter.
5. A post MUST include a `state` field set to `published` to be listed on the
   site. Posts with any other `state` value (e.g. `draft`) MUST NOT be shown.
6. A post SHOULD include a `date` field in `YYYY-MM-DD` format in its
   frontmatter. If no `date` is provided, the date SHOULD be inferred from the
   filename prefix (see §File Naming below).
7. A post MAY include a `tags` field containing a comma-separated list of tag
   values.

## File Naming

1. Post files MUST follow one of two naming conventions:
   - A flat file: `YYYY_MM_DD_slug.md`
   - A directory with a `document.md` inside: `YYYY_MM_DD_slug/document.md`
2. The `YYYY_MM_DD_` date prefix MUST appear at the start of the filename or
   directory name.
3. The slug portion of the filename MUST use hyphens as word separators and
   MUST consist only of lowercase alphanumeric characters and hyphens.
4. Post directories MAY contain a `media/` subdirectory for images and other
   assets referenced by the post content.

## Rendering

1. The site MUST render all post pages as statically generated HTML at build
   time.
2. Post content MUST be rendered using MDX, allowing JSX components to be
   embedded in Markdown.
3. The posts list page MUST display posts sorted by date in descending order
   (newest first).
4. Each post listing MUST display at minimum the post title, description, and
   publish date.
5. Individual post pages MUST display the post title, publish date, description,
   and body content.
6. The site MUST generate a `sitemap.xml` that includes all published post URLs.

## Authentication and Backend

1. The site MUST NOT require authentication to view any public page.
2. The site MUST NOT require a database connection at runtime.
3. The site MUST NOT expose any login, dashboard, or admin routes.
4. The site MUST NOT include any server-side API routes for content mutation
   (e.g. creating, editing, or deleting posts).
5. All content changes MUST be made by editing the MDX files directly and
   rebuilding the site.

## Dependencies

1. The site MUST NOT depend on any database client libraries at runtime.
2. The site MUST NOT depend on any authentication libraries at runtime.
3. The site SHOULD use `next-mdx-remote` for MDX serialization and rendering.
4. The site SHOULD use the `yaml` package already present in the project for
   frontmatter parsing.
5. The site MAY include analytics integrations (e.g. Google Analytics, Umami)
   that do not require server-side state.

## Deployment

1. The site SHOULD be deployable as a Cloudflare Workers application via
   OpenNext.
2. The site MUST be buildable with `npm run build` without any database or
   external service credentials.
3. The site SHOULD include a `sitemap.xml` generated from the post files.
