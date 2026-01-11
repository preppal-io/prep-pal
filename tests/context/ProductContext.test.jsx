import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { ProductProvider, useProductContext } from '../../src/context/ProductContext'
import { sampleProductCategories, sampleStock } from '../mocks/testData'

// Mock the fileUtils module
vi.mock('../../src/utils/fileUtils', () => ({
  readProductCategories: vi.fn(),
  writeProductCategories: vi.fn(),
  readStock: vi.fn(),
  writeStock: vi.fn(),
  checkProductCategoriesExist: vi.fn(),
  checkStockExists: vi.fn(),
  initializeDatabases: vi.fn(),
  deleteDatabases: vi.fn(),
}))

// Mock the littera library
vi.mock('@assembless/react-littera', () => ({
  useLittera: vi.fn(() => ({
    failedLoadingData: 'Failed to load product data',
    failedSavingData: 'Failed to save product data',
    failedSavingStockData: 'Failed to save stock data',
    failedDeletingData: 'Failed to delete data',
  })),
  useLitteraMethods: vi.fn(() => ({
    locale: 'en_US',
  })),
}))

// Import mocked modules
import * as fileUtils from '../../src/utils/fileUtils'

describe('ProductContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    fileUtils.checkProductCategoriesExist.mockResolvedValue(false)
    fileUtils.checkStockExists.mockResolvedValue(false)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // Wrapper component for renderHook
  const wrapper = ({ children }) => <ProductProvider>{children}</ProductProvider>

  describe('initial state', () => {
    it('starts with loading state', async () => {
      const { result } = renderHook(() => useProductContext(), { wrapper })

      // Check initial synchronous state
      expect(result.current.loading).toBe(true)

      // Wait for async operations to settle (prevents act warning)
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('has empty data when no files exist', async () => {
      let hookResult
      await act(async () => {
        const { result } = renderHook(() => useProductContext(), { wrapper })
        hookResult = result
      })

      await waitFor(() => {
        expect(hookResult.current.loading).toBe(false)
      })

      expect(hookResult.current.productData.baseCategories).toEqual([])
      expect(hookResult.current.productData.stock.products).toEqual([])
      expect(hookResult.current.filesExist.categories).toBe(false)
      expect(hookResult.current.filesExist.stock).toBe(false)
    })
  })

  describe('loading data', () => {
    it('loads data when files exist', async () => {
      fileUtils.checkProductCategoriesExist.mockResolvedValue(true)
      fileUtils.checkStockExists.mockResolvedValue(true)
      fileUtils.readProductCategories.mockResolvedValue(sampleProductCategories)
      fileUtils.readStock.mockResolvedValue(sampleStock)

      const { result } = renderHook(() => useProductContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.productData.baseCategories).toEqual(
        sampleProductCategories.baseCategories
      )
      expect(result.current.productData.stock).toEqual(sampleStock)
      expect(result.current.filesExist.categories).toBe(true)
      expect(result.current.filesExist.stock).toBe(true)
    })
  })

  describe('addCategory', () => {
    it('adds a new category with auto-generated ID', async () => {
      fileUtils.checkProductCategoriesExist.mockResolvedValue(true)
      fileUtils.checkStockExists.mockResolvedValue(true)
      fileUtils.readProductCategories.mockResolvedValue(sampleProductCategories)
      fileUtils.readStock.mockResolvedValue(sampleStock)
      fileUtils.writeProductCategories.mockResolvedValue(true)

      const { result } = renderHook(() => useProductContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newCategory = {
        productType: 'New Product',
        description: 'A new product',
        quantity: 10,
        categoryType: 'food',
      }

      let newId
      await act(async () => {
        newId = await result.current.addCategory(newCategory)
      })

      // Highest ID in sampleProductCategories is 3, so new ID should be 4
      expect(newId).toBe(4)
      expect(fileUtils.writeProductCategories).toHaveBeenCalled()

      const savedData = fileUtils.writeProductCategories.mock.calls[0][0]
      expect(savedData.baseCategories).toHaveLength(4)
      expect(savedData.baseCategories[3].id).toBe(4)
      expect(savedData.baseCategories[3].productType).toBe('New Product')
    })
  })

  describe('updateCategory', () => {
    it('updates an existing category', async () => {
      fileUtils.checkProductCategoriesExist.mockResolvedValue(true)
      fileUtils.checkStockExists.mockResolvedValue(true)
      fileUtils.readProductCategories.mockResolvedValue(sampleProductCategories)
      fileUtils.readStock.mockResolvedValue(sampleStock)
      fileUtils.writeProductCategories.mockResolvedValue(true)

      const { result } = renderHook(() => useProductContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.updateCategory(1, { quantity: 100 })
      })

      expect(fileUtils.writeProductCategories).toHaveBeenCalled()

      const savedData = fileUtils.writeProductCategories.mock.calls[0][0]
      const updatedCategory = savedData.baseCategories.find((cat) => cat.id === 1)
      expect(updatedCategory.quantity).toBe(100)
    })

    it('returns false for non-existent category', async () => {
      fileUtils.checkProductCategoriesExist.mockResolvedValue(true)
      fileUtils.checkStockExists.mockResolvedValue(true)
      fileUtils.readProductCategories.mockResolvedValue(sampleProductCategories)
      fileUtils.readStock.mockResolvedValue(sampleStock)

      const { result } = renderHook(() => useProductContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success
      await act(async () => {
        success = await result.current.updateCategory(999, { quantity: 100 })
      })

      expect(success).toBe(false)
      expect(fileUtils.writeProductCategories).not.toHaveBeenCalled()
    })
  })

  describe('saveStockData', () => {
    it('saves stock data and updates state', async () => {
      fileUtils.checkProductCategoriesExist.mockResolvedValue(true)
      fileUtils.checkStockExists.mockResolvedValue(true)
      fileUtils.readProductCategories.mockResolvedValue(sampleProductCategories)
      fileUtils.readStock.mockResolvedValue(sampleStock)
      fileUtils.writeStock.mockResolvedValue(true)

      const { result } = renderHook(() => useProductContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newStockData = {
        products: [
          {
            typeId: 1,
            description: 'New item',
            quantity: 5,
            checkedDate: '2025-01-01',
            nextCheck: '2025-07-01',
          },
        ],
      }

      await act(async () => {
        await result.current.saveStockData(newStockData)
      })

      expect(fileUtils.writeStock).toHaveBeenCalledWith(newStockData)
    })
  })

  describe('resetDatabases', () => {
    it('deletes all databases and clears state', async () => {
      fileUtils.checkProductCategoriesExist.mockResolvedValue(true)
      fileUtils.checkStockExists.mockResolvedValue(true)
      fileUtils.readProductCategories.mockResolvedValue(sampleProductCategories)
      fileUtils.readStock.mockResolvedValue(sampleStock)
      fileUtils.deleteDatabases.mockResolvedValue(true)

      const { result } = renderHook(() => useProductContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.resetDatabases()
      })

      expect(fileUtils.deleteDatabases).toHaveBeenCalled()
      expect(result.current.filesExist.categories).toBe(false)
      expect(result.current.filesExist.stock).toBe(false)
      expect(result.current.productData.baseCategories).toEqual([])
    })
  })
})

// Unit tests for cascading delete logic (extracted from context)
describe('Cascading Delete Logic', () => {
  const deleteCategory = (productData, categoryId) => {
    const newData = JSON.parse(JSON.stringify(productData)) // Deep copy

    const baseIndex = newData.baseCategories.findIndex((cat) => cat.id === categoryId)
    if (baseIndex === -1) {
      return { success: false, data: null }
    }

    // Remove the category
    newData.baseCategories.splice(baseIndex, 1)

    // Remove related stock items
    if (newData.stock && newData.stock.products) {
      newData.stock.products = newData.stock.products.filter(
        (item) => item.typeId !== categoryId
      )
    }

    return { success: true, data: newData }
  }

  it('removes category and related stock items', () => {
    const productData = {
      baseCategories: [
        { id: 1, productType: 'Water' },
        { id: 2, productType: 'Rice' },
      ],
      stock: {
        products: [
          { typeId: 1, description: 'Evian' },
          { typeId: 1, description: 'Volvic' },
          { typeId: 2, description: 'Basmati' },
        ],
      },
    }

    const result = deleteCategory(productData, 1)

    expect(result.success).toBe(true)
    expect(result.data.baseCategories).toHaveLength(1)
    expect(result.data.baseCategories[0].productType).toBe('Rice')
    expect(result.data.stock.products).toHaveLength(1)
    expect(result.data.stock.products[0].description).toBe('Basmati')
  })

  it('returns false for non-existent category', () => {
    const productData = {
      baseCategories: [{ id: 1, productType: 'Water' }],
      stock: { products: [] },
    }

    const result = deleteCategory(productData, 999)

    expect(result.success).toBe(false)
  })

  it('preserves stock items for other categories', () => {
    const productData = {
      baseCategories: [
        { id: 1, productType: 'Water' },
        { id: 2, productType: 'Rice' },
      ],
      stock: {
        products: [
          { typeId: 1, description: 'Evian' },
          { typeId: 2, description: 'Basmati' },
          { typeId: 2, description: 'Jasmine' },
        ],
      },
    }

    const result = deleteCategory(productData, 1)

    expect(result.success).toBe(true)
    expect(result.data.stock.products).toHaveLength(2)
    expect(result.data.stock.products.every((p) => p.typeId === 2)).toBe(true)
  })

  it('handles empty stock', () => {
    const productData = {
      baseCategories: [{ id: 1, productType: 'Water' }],
      stock: { products: [] },
    }

    const result = deleteCategory(productData, 1)

    expect(result.success).toBe(true)
    expect(result.data.baseCategories).toHaveLength(0)
  })

  it('handles missing stock object', () => {
    const productData = {
      baseCategories: [{ id: 1, productType: 'Water' }],
      stock: null,
    }

    const result = deleteCategory(productData, 1)

    expect(result.success).toBe(true)
    expect(result.data.baseCategories).toHaveLength(0)
  })
})
