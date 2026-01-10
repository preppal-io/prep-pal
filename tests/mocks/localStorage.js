import { vi } from 'vitest'

// In-memory storage for localStorage mock
let store = {}

export const localStorageMock = {
  getItem: vi.fn((key) => store[key] || null),
  setItem: vi.fn((key, value) => {
    store[key] = String(value)
  }),
  removeItem: vi.fn((key) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    store = {}
  }),
  get length() {
    return Object.keys(store).length
  },
  key: vi.fn((index) => Object.keys(store)[index] || null),
}

export const setupLocalStorageMock = () => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
}

export const resetLocalStorage = () => {
  store = {}
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
}

export const setLocalStorageItem = (key, value) => {
  store[key] = typeof value === 'string' ? value : JSON.stringify(value)
}

export const getLocalStorageStore = () => store
