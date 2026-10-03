# Vendored Quiescent packages

The four revision-named archives were built from `ncrmro/quiescent` commit
`bf2a9bd` (`feat/writing-workflow`). This includes snapshot-verified
GitHub ancestry batches, one shared document table for D1 and local SQLite,
cached public/admin/editor reads, read-only editor opens, and first-save branches.
Astro invalidates and warms affected public pages after published refreshes. It retains GIF preservation, the separate
32 MiB stored-original limit, and unreferenced originals during folder renames.
No npm publication is required.

From that exact Quiescent revision in its dev shell:

```sh
bun install --frozen-lockfile
bun run build:packages
```

Run `bun pm pack --destination <temporary-directory>` from each of `code/git`,
`code/server`, `code/editor` and `code/astro`. Copy the resulting archives into
this directory with `-bf2a9bd` before `.tgz`. Revision-specific filenames prevent
Bun from reusing a cached archive after package contents change.

The website's direct dependencies and transitive overrides point only at these
committed archives. Run `bun install` inside the website's `code/web` dev shell
to regenerate its lockfile. Keep previously referenced archives until that
transition finishes, then remove obsolete ones. Never hand-edit the lockfile.
Fresh installs need no external Quiescent checkout or unpublished registry version.
