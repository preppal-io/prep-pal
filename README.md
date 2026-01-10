# Prep-Pal

https://preppal.io/

Prep-Pal is a companion application to manage your emergency stock, based on standard recommendations.

It helps you track your items, get alerts about expiration and check dates, and buy what's missing. 

### Download

Head to the distribution section of this repository to download the latest build, or use the online version at https://preppal.io/app/

https://github.com/preppal-io/prep-pal/releases

# How-to use this code

1. Install Node.js and npm if you haven't already
2. Clone this repository
3. Open terminal in the project folder
4. Run: `npm install`

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

## Running locally

### Electron development

To run the app in development mode with hot reload:

`npm run electron:serve`

This will start both the React development server and Electron app. The app will automatically reload if you make changes to the code.

### Web browser development

To run the app in the browser during development with hot reload:

`npm run start`

## Build & Distribution

To create installable packages:

`npm run electron:build`

This will create distribution files in the dist folder:
- Windows: Look for .exe installer in dist/
- MacOS: Look for .dmg installer in dist/
- Linux: Look for .AppImage in dist/

Further reading: [PUBLISHING.md](./PUBLISHING.md)

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

## Troubleshooting

If you get errors about missing modules:
1. Delete the node_modules folder
2. Run: `npm install`
3. Try running the app again

If the app won't start:
1. Make sure all Node/npm processes are stopped
2. Try running `npm run electron:serve` again

For any other issues, check the console output for error messages.

# License

[LICENSE](./LICENSE)