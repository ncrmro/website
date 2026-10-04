# ncrmro.com

Personal website built with Astro and Quiescent on Cloudflare Workers.

Sign in at `/admin` with the allowlisted Google account to list posts, start a
new post, save drafts, upload images and publish. New drafts stay local until
first Save. The editor uses formatted text for supported Markdown and a lossless
Markdown textarea for tables, code, HTML and other extended content.

Posts live in `content/posts/<createdAt>-<slug>/index.md`, with stable UUIDs and
Quiescent state files. Drafts live on dedicated Git branches, not public pages.
All original images are Git LFS objects; R2 is a reconstructible delivery cache.
Body images use document-relative filenames. The site preserves animated GIF
originals instead of converting them to still images.

The published Quiescent npm packages manage documents on `main`. Preview builds
read their PR branch and remain read-only. See [the cutover guide](docs/quiescent-concept.md),
[architecture](docs/architecture.md) and [development instructions](CONTRIBUTING.md).
