# One-time Quiescent content import

These maintenance scripts are not used by the application. They reconcile the content at commit `b5c52b93e92c` with the Quiescent store before the concept cutover.

The import contains **71 documents: 42 published and 29 unpublished**, plus **43 image originals (136,045,387 bytes)**. Publication status comes from `published && !draft`. UUIDv5 uses each canonical post URL, so reruns produce the same identities. Browser slugs and original metadata remain unchanged; storage directories use `YYYY-MM-DD-slug`. Only media references change in the bodies, to document-relative filenames with content hashes. Inverse replacements must reconstruct the original body exactly. Animated GIF originals are retained unchanged.

Run from the repository root with the website dependencies installed:

```sh
node scripts/migration/migrate-content.mjs --apply-public
```

This reads the immutable source revision and hydrated originals (or the shared Git LFS object cache after removal), verifies SHA-256 and size against the original pointers, prepares `/tmp/website-quiescent-import`, and copies published documents into `content/posts`. Existing differing destination files cause an error rather than overwriting edits. `manifest.json` records the source hashes, identities, branch names, transformations, and media mappings. A fresh clone may need `git lfs fetch origin b5c52b93e92c` first.

After committing the verified application migration and removal of the old post/media directories, create the unpublished branches locally:

```sh
node scripts/migration/prepare-drafts.mjs <final-migration-commit> --create-local-refs
```

Each branch contains only its own document changes above that final commit, with the original image bytes stored in LFS. The command refuses a base that still contains legacy sources and refuses to overwrite differing existing branch refs. It never pushes. Review and push the exact manifest branches separately; Git LFS must upload their originals as well as those on the published branch.

Hydrate the dedicated delivery bucket using normal Wrangler credentials:

```sh
node scripts/migration/hydrate-media.mjs --upload-and-verify
```

This is an explicitly remote operation. It uploads each original to `ncrmro-website-quiescent-media/images/<document UUID>/<SHA-256>`, then downloads it and checks the entire byte hash and size. Rerunning writes identical content to identical keys. It does not extract or install credentials. `MIGRATION_OUTPUT` can override the staging directory for all commands.

Do not deploy the Quiescent-only app until the source branch and all draft/LFS objects are on GitHub, R2 verification has passed, and the Worker's dedicated `SERVICE_TOKEN` has been installed. Complete live public-content, authenticated draft editing, save/publish, cache, and image checks before calling the cutover complete.
