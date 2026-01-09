# Publishing PrepPal

This document explains how to build and publish the PrepPal application for Windows and macOS using electron-builder.

## Prerequisites

- Node.js and npm installed
- Git installed
- GitHub repository access (git@github.com:preppal-io/prep-pal.git)

## Local Building and Publishing

### Building Without Publishing

To build the application without publishing it to GitHub:

```bash
# Build for your current platform
npm run electron:build

# Build specifically for macOS
npm run electron:build:mac

# Build specifically for Windows
npm run electron:build:win
```

The built applications will be available in the `release` directory.

### Publishing to GitHub

To build and publish the application to GitHub:

1. Make sure you have a GitHub personal access token with the appropriate permissions.
2. Set the token as an environment variable:

```bash
# On macOS/Linux
export GH_TOKEN=your_github_token

# On Windows (Command Prompt)
set GH_TOKEN=your_github_token

# On Windows (PowerShell)
$env:GH_TOKEN="your_github_token"
```

> Note: the token needs the `repo` permission scope.

3. Run the publish command:

```bash
# Publish for your current platform
npm run electron:publish

# Publish specifically for macOS
npm run electron:publish:mac

# Publish specifically for Windows
npm run electron:publish:win
```

## Automated Publishing with GitHub Actions

The repository is configured to automatically build and publish the application when you push a version tag.

### Publishing a New Version

1. Update the version in `package.json`:

```json
{
  "name": "prep-pal",
  "version": "1.0.1",  // Increment this version
  ...
}
```

2. Commit your changes:

```bash
git add package.json
git commit -m "Bump version to 1.0.1"
```

3. Create and push a version tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

4. The GitHub Actions workflow will automatically build the application for Windows and macOS and publish the releases to GitHub.

### Versioning and publishing notes

- `npm version [major|minor|patch] -m "Message"` will increment the version and commit
- `git tag v1.0.0 && git push --tags` will tag the current commit and push it
- `git push --delete origin v1.0.0 && git tag --delete v1.0.0` will delete a specific tag
- `git commit --amend --no-edit` allows to modify a commit

## Auto-Updates

The application is configured to check for updates automatically when it starts. When a new version is available:

1. Users will be notified that an update is available and is being downloaded.
2. After the update is downloaded, they will be prompted to restart the application to apply the update.

## Notes

- The application is currently published without code signing. This means users may see security warnings when installing or running the application.
- For production use, it's recommended to set up code signing for both Windows and macOS.
- Mac builds are configured as Universal binaries, which means they will run natively on both Intel Macs (x64) and Apple Silicon Macs (arm64).
- The publishing configuration is set to only upload the executable files (DMG for Mac, NSIS/portable for Windows) and not the source code.

### Configuring GH repo for publishing

The app is using electron-builder to publish through GH actions. https://www.electron.build/publish.html

To configure the target repository for the build publishing:

> GitHub personal access token is required. You can generate by going to https://github.com/settings/tokens/new. The access token should have the repo scope/permission. Define GH_TOKEN environment variable.

Then add it as an action secret (`GH_TOKEN`)
