import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import StockStats from '../../src/components/StockStats'
import { MantineProvider } from '@mantine/core'

// Mock the ProductContext
const mockProductContextValue = {
  productData: {
    baseCategories: [],
    stock: { products: [] }
  },
  filesExist: { categories: false, stock: false }
}

vi.mock('../../src/context/ProductContext', () => ({
  useProductContext: vi.fn(() => mockProductContextValue)
}))

// Mock the littera library
vi.mock('@assembless/react-littera', () => ({
  useLittera: vi.fn(() => ({
    categoriesOk: 'Stock OK',
    lowStock: 'Low stock',
    lastCheck: 'Last check',
    never: 'Never',
    categoriesOkTooltip: 'Categories with sufficient stock',
    lowStockTooltip: 'Categories with insufficient stock',
    lastCheckTooltip: 'Date and time of the last modification'
  }))
}))

import { useProductContext } from '../../src/context/ProductContext'

const renderStockStats = () => {
  return render(
    <MantineProvider>
      <StockStats />
    </MantineProvider>
  )
}

describe('StockStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when databases are not initialized', () => {
    it('renders nothing when filesExist is false', () => {
      useProductContext.mockReturnValue({
        productData: { baseCategories: [], stock: { products: [] } },
        filesExist: { categories: false, stock: false }
      })

      renderStockStats()
      // Should not render any stat text
      expect(screen.queryByText(/Stock OK/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Low stock/)).not.toBeInTheDocument()
    })

    it('renders nothing when only categories exist', () => {
      useProductContext.mockReturnValue({
        productData: { baseCategories: [], stock: { products: [] } },
        filesExist: { categories: true, stock: false }
      })

      renderStockStats()
      // Should not render any stat text
      expect(screen.queryByText(/Stock OK/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Low stock/)).not.toBeInTheDocument()
    })
  })

  describe('when databases are initialized', () => {
    it('shows "Never" when no stock items exist', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 10, quantityOverride: '' }
          ],
          stock: { products: [] }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      expect(screen.getByText('Never')).toBeInTheDocument()
    })

    it('displays most recent checkedDate from stock items', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 10, quantityOverride: '' }
          ],
          stock: {
            products: [
              { typeId: 1, quantity: 5, checkedDate: '2025-01-10' },
              { typeId: 1, quantity: 5, checkedDate: '2025-01-15' }  // Most recent
            ]
          }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      // The date will be formatted according to locale, so we just check it's not "Never"
      expect(screen.queryByText('Never')).not.toBeInTheDocument()
    })

    it('counts categories with enough stock correctly', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 10, quantityOverride: '' },  // Will have 100% stock
            { id: 2, quantity: 20, quantityOverride: '' },  // Will have 25% stock (low)
          ],
          stock: {
            products: [
              { typeId: 1, quantity: 10, checkedDate: '2025-01-15' },  // 100% of 10
              { typeId: 2, quantity: 5, checkedDate: '2025-01-15' },   // 25% of 20 (below 65% threshold)
            ]
          }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      expect(screen.getByText(/1 Stock OK/)).toBeInTheDocument()
      expect(screen.getByText(/1 Low stock/)).toBeInTheDocument()
    })

    it('uses quantityOverride when available', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 100, quantityOverride: 10 },  // Override to 10, will have 100% stock
          ],
          stock: {
            products: [
              { typeId: 1, quantity: 10, checkedDate: '2025-01-15' },  // 100% of override (10)
            ]
          }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      expect(screen.getByText(/1 Stock OK/)).toBeInTheDocument()
      expect(screen.getByText(/0 Low stock/)).toBeInTheDocument()
    })

    it('skips categories with zero recommended quantity', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 0, quantityOverride: '' },   // Zero quantity, should skip
            { id: 2, quantity: 10, quantityOverride: '' },  // Normal category
          ],
          stock: {
            products: [
              { typeId: 2, quantity: 10, checkedDate: '2025-01-15' },
            ]
          }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      // Should only count 1 category (id: 2)
      expect(screen.getByText(/1 Stock OK/)).toBeInTheDocument()
    })

    it('aggregates multiple stock items for the same category', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 100, quantityOverride: '' },
          ],
          stock: {
            products: [
              { typeId: 1, quantity: 30, checkedDate: '2025-01-10' },
              { typeId: 1, quantity: 40, checkedDate: '2025-01-15' },  // Total 70, which is 70% (>= 65% threshold)
            ]
          }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      expect(screen.getByText(/1 Stock OK/)).toBeInTheDocument()
    })

    it('finds most recent date among all stock items', () => {
      useProductContext.mockReturnValue({
        productData: {
          baseCategories: [
            { id: 1, quantity: 10, quantityOverride: '' },
            { id: 2, quantity: 10, quantityOverride: '' },
          ],
          stock: {
            products: [
              { typeId: 1, quantity: 5, checkedDate: '2025-01-01' },
              { typeId: 2, quantity: 5, checkedDate: '2025-01-20' },  // Most recent
              { typeId: 1, quantity: 5, checkedDate: '2025-01-10' },
            ]
          }
        },
        filesExist: { categories: true, stock: true }
      })

      renderStockStats()
      // Check that it doesn't show "Never" - the most recent date should be displayed
      expect(screen.queryByText('Never')).not.toBeInTheDocument()
    })
  })
})
