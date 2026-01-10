# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm start` - Run React development server (browser-only)
- `npm run electron:serve` - Run full Electron app in development mode with hot reload

### Building
- `npm run build` - Build React app for production
- `npm run electron:build` - Build complete Electron app for current platform
- `npm run electron:build:mac` - Build for macOS specifically
- `npm run electron:build:win` - Build for Windows specifically
- `npm run electron:build:linux` - Build for Linux specifically (AppImage)

### Publishing
- `npm run electron:publish` - Build and publish to GitHub releases for current platform
- Publishing requires `GH_TOKEN` environment variable with GitHub personal access token
- CI/CD automatically builds and publishes for macOS, Windows, and Linux when a version tag is pushed

### Testing
- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run Vitest once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright e2e tests (requires local environment)
- `npm run test:e2e:ui` - Run Playwright with UI mode

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Development Container (Claude Code)

This project includes a devcontainer configuration for secure Claude Code development.

### Quick Start
1. Install VS Code and the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open this repository in VS Code
3. When prompted, click "Reopen in Container" (or use Command Palette: `Ctrl+Shift+P` → "Remote-Containers: Reopen in Container")
4. Run `claude` in the terminal to start Claude Code

### Features
- Pre-installed Claude Code CLI
- Node.js 20 with development tools (git, zsh, fzf, gh)
- Network firewall restricting outbound connections to whitelisted domains only
- Persistent command history and Claude configuration between sessions
- VS Code extensions: ESLint, Prettier, GitLens

### Without VS Code (Docker CLI)
```bash
# Build the container
docker build -t prep-pal-devcontainer .devcontainer/

# Run interactively with the project mounted
docker run -it --rm \
  --cap-add=NET_ADMIN \
  --cap-add=NET_RAW \
  -v "$(pwd):/workspace" \
  -w /workspace \
  prep-pal-devcontainer

# Once inside, initialize firewall and start Claude
sudo /usr/local/bin/init-firewall.sh
npm install
claude
```

### Using devcontainer CLI
```bash
# Install the CLI
npm install -g @devcontainers/cli

# Start the container
devcontainer up --workspace-folder .

# Execute commands inside
devcontainer exec --workspace-folder . -- claude
```

### Security
The devcontainer implements a firewall that only allows connections to:
- npm registry
- GitHub (API, web, git)
- Claude API (api.anthropic.com)
- VS Code marketplace and updates

All other outbound network access is blocked for enhanced security.

### Playwright Support
The devcontainer includes pre-installed Playwright browsers and the Playwright MCP server, enabling:
- Running e2e tests with `npm run test:e2e`
- Interactive browser automation via the Playwright MCP

The MCP is configured in `.mcp.json` and provides browser control capabilities to Claude Code.

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with Vite as build tool
- **UI Library**: Mantine v8 (components, hooks, notifications, dates)
- **Desktop**: Electron with auto-updater support
- **Routing**: React Router DOM v7 with HashRouter
- **Internationalization**: Littera for multi-language support (FR, DE, EN)
- **Icons**: Phosphor Icons React

### Application Structure
- **Hybrid App**: Can run both as web browser app and Electron desktop app
- **Context-Based State**: Uses React contexts for global state management
  - `ProductContext` - manages product categories and stock data
  - `UserContext` - manages user profile and preferences
- **File Storage**: Electron app stores data in JSON files in user data directory
  - `productCategories.json` - product categories and recommended quantities
  - `stock.json` - user's current stock items with expiration dates
  - `userProfile.json` - user preferences including language

### Key Screens
- **RecommendedScreen** (`/recommended`) - Shows recommended categories and quantities
- **CurrentScreen** (`/current`) - Manage current stock with expiration tracking
- **ShoppingListScreen** (`/shopping-list`) - Generated shopping list based on missing items

### Data Flow
- Web version uses localStorage for data persistence
- Electron version uses IPC to communicate with main process for file operations
- Main process handles all file I/O operations in the user data directory
- Template data files in `src/data/` provide initial structure

### Electron Main Process
- Handles file operations via IPC handlers for reading/writing JSON data
- Manages auto-updates using electron-updater
- Supports data import/export functionality
- Uses custom Vite plugin to copy Electron files to build directory

### Build Process
- Vite builds React app to `dist/`
- Custom plugin copies `electron/main.js` to `build/electron/main.js`
- Electron-builder packages the complete application

### Internationalization
- Uses Littera library with locale switching
- Supports French (CH), German (CH), and English (US)
- User language preference stored in user profile
- Translation keys defined per component/screen