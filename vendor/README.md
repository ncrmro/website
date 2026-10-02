# Quiescent concept packages

These four tarballs were built from `ncrmro/quiescent` revision `a732ab0`
(`feat/writing-workflow`). They include the declarative document config,
Astro page caching and writing editor. No npm publication is required.

To refresh reproducibly from that revision, use the Quiescent dev shell:

```sh
bun install --frozen-lockfile
bun run build:packages
```

Then run `bun pm pack --destination <website-checkout>/vendor` separately from
`code/git`, `code/server`, `code/editor` and `code/astro` in that checkout. Bun
resolves workspace dependencies to package versions when packing. Commit the
four resulting tarballs and update this source revision. Run `bun install` from
the website's `code/web` dev shell to regenerate its lockfile; do not hand-edit it.

The website's direct dependencies and transitive overrides all point at these
committed relative tarballs. Fresh installs need neither the Quiescent checkout
nor unpublished registry versions. Sources remain maintained upstream; the
website's `src/writing` and editor components adapt its working example to the
website's existing Google session and public content routes.
