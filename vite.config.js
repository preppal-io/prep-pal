import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from 'path'
import fs from 'fs'

// Custom plugin to copy electron files to build directory
const copyElectronFiles = () => {
  return {
    name: 'copy-electron-files',
    closeBundle() {
      // Create build/electron directory if it doesn't exist
      const buildElectronDir = resolve(__dirname, 'build/electron')
      if (!fs.existsSync(buildElectronDir)) {
        fs.mkdirSync(buildElectronDir, { recursive: true })
      }
      
      // Copy main.js to build/electron directory
      fs.copyFileSync(
        resolve(__dirname, 'electron/main.js'),
        resolve(buildElectronDir, 'main.js')
      )
      
      console.log('Electron files copied to build/electron directory')
    }
  }
}

export default defineConfig({
  plugins: [react(), copyElectronFiles()],
  server: {
    port: 3000,
    open: true,
  },
  base: './', // Set base path for the entire application
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
