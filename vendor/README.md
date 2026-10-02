# Vendored Quiescent packages

The four revision-named archives were built from `ncrmro/quiescent` commit
`b3ce425` (`feat/writing-workflow`). This adds GIF preservation, a separate
32 MiB stored-original limit, and retention of unreferenced originals during
folder renames to the earlier writing workflow. No npm publication is required.

From that exact Quiescent revision in its dev shell:

```sh
bun install --frozen-lockfile
bun run build:packages
```

Run `bun pm pack --destination <temporary-directory>` from each of `code/git`,
`code/server`, `code/editor` and `code/astro`. Copy the resulting archives into
this directory with `-b3ce425` before `.tgz`. Revision-specific filenames prevent
Bun from reusing a cached archive after package contents change.

The website's direct dependencies and transitive overrides point only at these
committed archives. Run `bun install` inside the website's `code/web` dev shell
to regenerate its lockfile. Keep previously referenced archives until that
transition finishes, then remove obsolete ones. Never hand-edit the lockfile.
Fresh installs need no external Quiescent checkout or unpublished registry version.
