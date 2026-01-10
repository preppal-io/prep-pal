import { describe, it, expect, vi, beforeEach } from 'vitest'

// Unit tests for the CurrentScreen algorithm logic
// These test the core business logic without rendering React components

describe('CurrentScreen - Algorithm Logic', () => {
  describe('stock grouping algorithm', () => {
    // Replicates logic from CurrentScreen.jsx lines 80-132
    const groupStockItems = (baseCategories, stockProducts, isTodayAfterFn = () => false) => {
      if (!baseCategories) return []

      const grouped = {}

      // Add all categories with non-zero quantity
      baseCategories.forEach((category) => {
        const quantity = category.quantityOverride || category.quantity
        if (quantity > 0) {
          grouped[category.id] = {
            category,
            items: [],
          }
        }
      })

      // Add stock items to categories
      if (stockProducts) {
        stockProducts.forEach((item) => {
          if (!grouped[item.typeId]) {
            const category = baseCategories.find((cat) => cat.id === item.typeId) || {
              productType: 'Unknown Category',
              id: item.typeId,
            }
            grouped[item.typeId] = {
              category,
              items: [],
            }
          }
          grouped[item.typeId].items.push(item)
        })
      }

      // Calculate totals and percentages
      Object.values(grouped).forEach((group) => {
        group.totalQuantity = group.items.reduce((sum, item) => sum + (item.quantity || 0), 0)

        const categoryQuantity = group.category.quantityOverride || group.category.quantity
        group.stockPercentage =
          categoryQuantity > 0 ? Math.round((group.totalQuantity / categoryQuantity) * 100) : 100

        group.hasExpired = group.items.some((item) => isTodayAfterFn(item.nextCheck))
      })

      return Object.values(grouped).sort((a, b) => a.category.id - b.category.id)
    }

    it('groups stock items by category', () => {
      const categories = [
        { id: 1, productType: 'Water', quantity: 60 },
        { id: 2, productType: 'Rice', quantity: 10 },
      ]
      const stock = [
        { typeId: 1, description: 'Evian', quantity: 20 },
        { typeId: 1, description: 'Volvic', quantity: 15 },
        { typeId: 2, description: 'Basmati', quantity: 5 },
      ]

      const result = groupStockItems(categories, stock)

      expect(result).toHaveLength(2)
      expect(result[0].category.productType).toBe('Water')
      expect(result[0].items).toHaveLength(2)
      expect(result[1].category.productType).toBe('Rice')
      expect(result[1].items).toHaveLength(1)
    })

    it('shows categories with zero stock but positive quantity requirement', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = []

      const result = groupStockItems(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].totalQuantity).toBe(0)
    })

    it('handles stock items with unknown category', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = [{ typeId: 999, description: 'Unknown Item', quantity: 5 }]

      const result = groupStockItems(categories, stock)

      expect(result).toHaveLength(2)
      const unknownGroup = result.find((g) => g.category.id === 999)
      expect(unknownGroup.category.productType).toBe('Unknown Category')
    })

    it('excludes categories with zero quantity', () => {
      const categories = [
        { id: 1, productType: 'Water', quantity: 60 },
        { id: 2, productType: 'Empty', quantity: 0 },
      ]
      const stock = []

      const result = groupStockItems(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].category.productType).toBe('Water')
    })
  })

  describe('stock percentage calculation', () => {
    const calculateStockPercentage = (totalQuantity, categoryQuantity) => {
      return categoryQuantity > 0 ? Math.round((totalQuantity / categoryQuantity) * 100) : 100
    }

    it('calculates 100% when stock equals required', () => {
      expect(calculateStockPercentage(60, 60)).toBe(100)
    })

    it('calculates percentage correctly when stock is partial', () => {
      expect(calculateStockPercentage(30, 60)).toBe(50)
    })

    it('calculates percentage for low stock', () => {
      expect(calculateStockPercentage(20, 60)).toBe(33)
    })

    it('returns 100% when category quantity is 0', () => {
      expect(calculateStockPercentage(5, 0)).toBe(100)
    })

    it('handles overstock (>100%)', () => {
      expect(calculateStockPercentage(90, 60)).toBe(150)
    })

    it('rounds to nearest integer', () => {
      expect(calculateStockPercentage(35, 60)).toBe(58) // 58.33...
      expect(calculateStockPercentage(37, 60)).toBe(62) // 61.66...
    })
  })

  describe('stock aggregation', () => {
    const aggregateStockQuantity = (items) => {
      return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    }

    it('sums quantities from multiple items', () => {
      const items = [{ quantity: 20 }, { quantity: 15 }, { quantity: 10 }]
      expect(aggregateStockQuantity(items)).toBe(45)
    })

    it('handles empty array', () => {
      expect(aggregateStockQuantity([])).toBe(0)
    })

    it('handles items with missing quantity', () => {
      const items = [{ quantity: 20 }, {}, { quantity: 10 }]
      expect(aggregateStockQuantity(items)).toBe(30)
    })

    it('handles items with zero quantity', () => {
      const items = [{ quantity: 0 }, { quantity: 15 }]
      expect(aggregateStockQuantity(items)).toBe(15)
    })
  })

  describe('stock item deduplication (3-part key)', () => {
    const findMatchingItem = (products, targetItem) => {
      return products.find(
        (stockItem) =>
          stockItem.typeId === targetItem.typeId &&
          stockItem.description === targetItem.description &&
          stockItem.checkedDate === targetItem.checkedDate
      )
    }

    it('finds matching item with all three fields', () => {
      const products = [
        { typeId: 1, description: 'Evian', checkedDate: '2025-01-01', quantity: 20 },
        { typeId: 1, description: 'Volvic', checkedDate: '2025-01-01', quantity: 15 },
      ]

      const match = findMatchingItem(products, {
        typeId: 1,
        description: 'Evian',
        checkedDate: '2025-01-01',
      })

      expect(match).toBeDefined()
      expect(match.quantity).toBe(20)
    })

    it('does not match when typeId differs', () => {
      const products = [{ typeId: 1, description: 'Evian', checkedDate: '2025-01-01', quantity: 20 }]

      const match = findMatchingItem(products, {
        typeId: 2,
        description: 'Evian',
        checkedDate: '2025-01-01',
      })

      expect(match).toBeUndefined()
    })

    it('does not match when description differs', () => {
      const products = [{ typeId: 1, description: 'Evian', checkedDate: '2025-01-01', quantity: 20 }]

      const match = findMatchingItem(products, {
        typeId: 1,
        description: 'Volvic',
        checkedDate: '2025-01-01',
      })

      expect(match).toBeUndefined()
    })

    it('does not match when checkedDate differs', () => {
      const products = [{ typeId: 1, description: 'Evian', checkedDate: '2025-01-01', quantity: 20 }]

      const match = findMatchingItem(products, {
        typeId: 1,
        description: 'Evian',
        checkedDate: '2025-01-02',
      })

      expect(match).toBeUndefined()
    })

    it('finds first match when duplicates exist (potential data issue)', () => {
      const products = [
        { typeId: 1, description: 'Evian', checkedDate: '2025-01-01', quantity: 20 },
        { typeId: 1, description: 'Evian', checkedDate: '2025-01-01', quantity: 50 },
      ]

      const match = findMatchingItem(products, {
        typeId: 1,
        description: 'Evian',
        checkedDate: '2025-01-01',
      })

      expect(match.quantity).toBe(20) // Only finds first
    })
  })

  describe('stock threshold classification', () => {
    const LOW_STOCK_THRESHOLD = 65
    const CRITICAL_STOCK_THRESHOLD = 35

    const getStockStatus = (percentage) => {
      if (percentage <= CRITICAL_STOCK_THRESHOLD) return 'critical'
      if (percentage <= LOW_STOCK_THRESHOLD) return 'low'
      return 'ok'
    }

    it('classifies 100% as ok', () => {
      expect(getStockStatus(100)).toBe('ok')
    })

    it('classifies 66% as ok', () => {
      expect(getStockStatus(66)).toBe('ok')
    })

    it('classifies 65% as low', () => {
      expect(getStockStatus(65)).toBe('low')
    })

    it('classifies 50% as low', () => {
      expect(getStockStatus(50)).toBe('low')
    })

    it('classifies 36% as low', () => {
      expect(getStockStatus(36)).toBe('low')
    })

    it('classifies 35% as critical', () => {
      expect(getStockStatus(35)).toBe('critical')
    })

    it('classifies 0% as critical', () => {
      expect(getStockStatus(0)).toBe('critical')
    })
  })

  describe('expiration detection', () => {
    const hasExpiredItems = (items, isTodayAfterFn) => {
      return items.some((item) => isTodayAfterFn(item.nextCheck))
    }

    it('detects expired items', () => {
      const items = [
        { nextCheck: '2024-01-01' },
        { nextCheck: '2025-06-01' },
      ]
      const mockIsTodayAfter = (date) => date < '2025-01-01'

      expect(hasExpiredItems(items, mockIsTodayAfter)).toBe(true)
    })

    it('returns false when no expired items', () => {
      const items = [
        { nextCheck: '2025-06-01' },
        { nextCheck: '2025-12-01' },
      ]
      const mockIsTodayAfter = (date) => date < '2025-01-01'

      expect(hasExpiredItems(items, mockIsTodayAfter)).toBe(false)
    })

    it('handles empty items array', () => {
      const mockIsTodayAfter = () => true

      expect(hasExpiredItems([], mockIsTodayAfter)).toBe(false)
    })
  })
})
