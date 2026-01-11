# Development workflow

This file documents development tools and flows added to this repo. Mainly for the future-me coming back in 3 months having forgotten how-to.

## Tools

- Devcontainer: to isolate dev work. It's useful if you want to let Claude run loose (`--dangerously-skip-permissions`). You can use it with VSCode, docker directly, or with the devcontainer cli
- `claude> /publish-version minor` will do the publishing for you
- Test: both units and e2e are setup. Use them! (`npm run test:e2e`, `npm run test:run`)
- Linter and prettier same: use them!
- Netlify automatically pushes main to the web (if tests are successful)
- Architecture: there's visualization using structurizer. Use claude to update it if there's a lot of diff

## Commands repository

- Start the container: `devcontainer up --workspace-folder .`
- Zsh in container: `devcontainer exec --workspace-folder . -- zsh`
- Create a worktree for claude: (create a folder in .features folder) then, `git worktree add feature-name -b feature-name`
- Start the dev in browser: `npm run start`

## Devcontainer quirks

- If you need to auth git there: `gh auth login` then `gh auth setup-git` -> but you can handle git from the local machine directly instead of from the container (just go in the folder, it will detect the branch :) )

# Additional documentation

## Development Container (Recommended for Claude Code)

This project includes a devcontainer for secure development with Claude Code.

### Prerequisites

- [VS Code](https://code.visualstudio.com/) with [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Getting Started

1. Open this repository in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: `Ctrl+Shift+P` → "Remote-Containers: Reopen in Container")
3. Wait for the container to build (first time only)
4. Run `npm install` to install dependencies
5. Run `claude` to start Claude Code CLI

### What's Included

- Node.js 20 environment
- Pre-installed Claude Code CLI
- Development tools: git, zsh, fzf, GitHub CLI
- Network firewall for enhanced security (restricts outbound connections to whitelisted domains)
- VS Code extensions: ESLint, Prettier, GitLens

### Running Claude Code

```bash
# Start Claude Code in the container
claude

# For unattended operation with enhanced isolation
claude --dangerously-skip-permissions
```

### Without VS Code (Docker CLI)

If you prefer to work directly with Docker or SSH into the container:

```bash
# Build the container image
docker build -t prep-pal-devcontainer .devcontainer/

# Run interactively with the project mounted
docker run -it --rm \
  --cap-add=NET_ADMIN \
  --cap-add=NET_RAW \
  -v "$(pwd):/workspace" \
  -w /workspace \
  prep-pal-devcontainer

# Once inside the container, initialize the firewall and start working
sudo /usr/local/bin/init-firewall.sh
npm install
claude
```

### Using devcontainer CLI

You can also use the official devcontainer CLI:

```bash
# Install the CLI globally
npm install -g @devcontainers/cli

# Start the container
devcontainer up --workspace-folder .

# Open a shell inside the container
devcontainer exec --workspace-folder . -- zsh

# Or run Claude directly
devcontainer exec --workspace-folder . -- claude
```

## Testing

### Unit Tests (Vitest)

Unit tests are located in the `tests/` directory and use Vitest with React Testing Library.

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

End-to-end tests are in the `e2e/` directory and use Playwright.

```bash
# Run e2e tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui
```

**Note:** Playwright tests require browser binaries. Install them with:

```bash
npx playwright install chromium
```

> **Devcontainer users:** Playwright browsers are pre-installed in the devcontainer image.

### Code Quality

```bash
# Lint code
npm run lint
npm run lint:fix  # with auto-fix

# Format code
npm run format
npm run format:check  # check only
```

## Architecture Documentation

The project's architecture is documented using Structurizr DSL in the `architecture/` folder.

To visualize the architecture diagrams:

```bash
docker run -it --rm -p 8080:8080 -v $(pwd)/architecture:/usr/local/structurizr structurizr/lite
```

Then open your browser to http://localhost:8080

The documentation includes:

- Level 1: System Context diagram
- Level 2: Container diagram
- Level 3: Component diagrams for React App, Electron Main Process, and File Storage
