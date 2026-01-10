import { vi } from 'vitest'

// Mock data stores
let productCategoriesData = null
let stockData = null
let userProfileData = null

// IPC handlers mock
const ipcHandlers = {
  'read-product-categories': vi.fn(() => productCategoriesData),
  'write-product-categories': vi.fn((data) => {
    productCategoriesData = data
    return true
  }),
  'read-stock': vi.fn(() => stockData),
  'write-stock': vi.fn((data) => {
    stockData = data
    return true
  }),
  'delete-product-categories': vi.fn(() => {
    productCategoriesData = null
    return true
  }),
  'delete-stock': vi.fn(() => {
    stockData = null
    return true
  }),
  'read-user-profile': vi.fn(() => userProfileData),
  'write-user-profile': vi.fn((data) => {
    userProfileData = data
    return true
  }),
}

export const ipcRenderer = {
  invoke: vi.fn((channel, data) => {
    const handler = ipcHandlers[channel]
    if (handler) {
      return Promise.resolve(handler(data))
    }
    return Promise.reject(new Error(`Unknown IPC channel: ${channel}`))
  }),
}

export const shell = {
  openExternal: vi.fn(),
}

export const setupElectronMock = () => {
  window.process = { type: 'renderer' }
  window.require = vi.fn((module) => {
    if (module === 'electron') {
      return { ipcRenderer, shell }
    }
    throw new Error(`Unknown module: ${module}`)
  })
}

export const resetElectronMock = () => {
  productCategoriesData = null
  stockData = null
  userProfileData = null
  ipcRenderer.invoke.mockClear()
  shell.openExternal.mockClear()
  Object.values(ipcHandlers).forEach((handler) => handler.mockClear())
}

export const setMockProductCategories = (data) => {
  productCategoriesData = data
}

export const setMockStock = (data) => {
  stockData = data
}

export const setMockUserProfile = (data) => {
  userProfileData = data
}

export const getMockProductCategories = () => productCategoriesData
export const getMockStock = () => stockData
export const getMockUserProfile = () => userProfileData
