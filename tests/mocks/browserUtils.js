import { vi } from 'vitest'

// Mock for browserUtils - controls isElectron return value
let isElectronValue = false

export const mockIsElectron = (value) => {
  isElectronValue = value
}

export const isElectron = vi.fn(() => isElectronValue)

export const openInBrowser = vi.fn()

export const resetBrowserMocks = () => {
  isElectronValue = false
  isElectron.mockClear()
  openInBrowser.mockClear()
}
