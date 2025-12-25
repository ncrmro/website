{
  description = "ncrmro website development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js
            nodejs_22
            pnpm

            # Database
            sqld

            # Development tools
            concurrently

            # Claude Code CLI
            claude-code

            # Playwright dependencies
            playwright-driver.browsers
          ];

          shellHook = ''
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true

            # Set up local database path
            export DATABASE_URL="file:./local.db"
            export DB_PORT=8080

            echo "🚀 ncrmro website dev shell ready"
            echo "   Run 'make up' to start libsql + Next.js"
            echo "   Run 'claude' to start Claude Code"
          '';
        };
      }
    );
}
