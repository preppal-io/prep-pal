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