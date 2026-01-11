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

## Running locally

### Electron development

To run the app in development mode with hot reload:

`npm run electron:serve`

This will start both the React development server and Electron app. The app will automatically reload if you make changes to the code.

### Web browser development

To run the app in the browser during development with hot reload:

`npm run start`

Further reading for developers: [DEV.md](./DEV.md)

## Build & Distribution

To create installable packages:

`npm run electron:build`

This will create distribution files in the dist folder:

- Windows: Look for .exe installer in dist/
- MacOS: Look for .dmg installer in dist/
- Linux: Look for .AppImage in dist/

Further reading: [PUBLISHING.md](./PUBLISHING.md)

# License

[LICENSE](./LICENSE)
