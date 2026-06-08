{ pkgs, inputs, ... }:

{
  packages = with pkgs; [
    nodejs_22
    bun
    inputs.llm-agents.packages.${pkgs.system}.claude-code
    playwright-mcp
    playwright-driver
  ];

  env = {
    PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
  };

  enterShell = ''
    export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$(find "$PLAYWRIGHT_BROWSERS_PATH" -name chrome | head -n 1)
    echo "ncrmro website dev shell ready"
    echo "  bun $(bun --version)"
    echo "  Run 'bun run dev' to start the Astro dev server"
  '';
}
