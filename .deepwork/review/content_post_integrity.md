Review changed blog content/frontmatter files for publication and rendering integrity.

Report PASS if no issues are found.

Check:

1. Frontmatter schema
   - `title` is present and non-empty.
   - `description`, when present, is useful for previews and not stale.
   - `publish_date`, when present, is a valid date.
   - `published` reflects intent; do not silently publish drafts or hide intended public posts.
   - `tags` is an array of simple strings when present.
   - `heroImage` references an available file when present.

2. Content rendering
   - MDX syntax is valid: balanced JSX tags, no unescaped problematic braces, no broken frontmatter fence.
   - Internal links use current site paths and post slugs.
   - Images use absolute paths like `/posts/<slug>/media/<file>` and the media should exist under `code/web/public/posts/<slug>/media/`.

3. Editorial quality for technical posts
   - Flag obvious copy/paste leftovers, contradictory statements, or instructions that reference removed repo paths.
   - Do not do broad stylistic editing; only report issues likely to confuse readers or break rendering.

For each issue, include severity, file:line, why it matters, and a concrete fix.
