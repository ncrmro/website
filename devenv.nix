{ pkgs, ... }:

{
  packages = with pkgs; [
    nodejs_22
    bun
    playwright-mcp
    playwright-driver
  ];

  env = {
    PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
  };

  # The dev server — `devenv up` is the way to start it (`-d` to detach).
  # Host and port are declared here and in the app's `dev` script, never typed
  # by hand: a hand-passed `--host`/`--port` silently overrides the config, and
  # a loopback binding refuses connections by machine hostname before
  # allowedHosts is ever consulted. Bind 0.0.0.0 so the server answers on the
  # LAN/tailnet name (ncrmro-workstation, ncrmro-laptop-14); astro ports are
  # non-strict, so a taken 4321 falls forward and parallel worktrees never
  # fight over it. Prerequisite: `bun install` in code/web.
  processes.web.exec = "cd code/web && node node_modules/.bin/astro dev --host 0.0.0.0 --port 4321";

  enterShell = ''
    export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$(find "$PLAYWRIGHT_BROWSERS_PATH" -name chrome | head -n 1)
    echo "ncrmro website dev shell ready"
    echo "  bun $(bun --version)"
    echo "  Run 'devenv up' (or 'bun run dev' in code/web) to start the Astro dev server"
  '';
}
