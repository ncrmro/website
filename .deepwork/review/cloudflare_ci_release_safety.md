Review deployment, Cloudflare, dependency, and CI changes for safety.

Focus on regressions that could silently break production, previews, or CI gates. Report PASS if no issues are found.

Check:

1. GitHub Actions gates
   - Build/install steps should run from `code/web` after the workspace move.
   - `bun install --frozen-lockfile` should not be weakened unless explicitly justified.
   - New `continue-on-error`, removed required jobs, or changed workflow path filters should not silently reduce protection.
   - Preview workflow should continue to comment exactly one useful preview URL on same-repo PRs.

2. Cloudflare Workers config
   - `wrangler.jsonc` should not contain secrets in `vars`; only non-secret configuration belongs there.
   - Worker name and asset directory should stay consistent with the deploy/preview action.
   - Auth URL/proxy settings should match the expected production redirect proxy (`https://ncrmro.com/api/auth`) when preview OAuth depends on it.

3. Dependency and lockfile hygiene
   - `package.json` and `bun.lock` should stay in sync.
   - Added dependencies should be necessary for runtime/build behavior and not duplicate existing stack choices.
   - Generated artifacts (`dist`, `.astro`, `node_modules`, caches) must not be committed.

4. Devenv/release hygiene
   - `.envrc`, `devenv.nix`, and `devenv.yaml` should keep local commands reproducible without affecting CI unexpectedly.
   - Deployment scripts should preserve the production deploy path and not require local-only tools.

For each issue, include severity, file:line, why it matters, and a concrete fix.
