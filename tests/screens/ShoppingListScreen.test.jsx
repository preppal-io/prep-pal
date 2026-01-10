import { describe, it, expect, vi, beforeEach } from 'vitest'

// Unit tests for the shopping list algorithm logic from ShoppingListScreen.jsx
// These test the core business logic without rendering React components

describe('ShoppingListScreen - Algorithm Logic', () => {
  describe('shopping list calculation algorithm', () => {
    // This replicates the logic from ShoppingListScreen.jsx lines 55-85
    const calculateShoppingList = (baseCategories, stockProducts) => {
      // Create a map to store the sum of quantities for each category
      const categoryQuantities = {}

      // Initialize with all categories having 0 current quantity
      baseCategories.forEach((category) => {
        categoryQuantities[category.id] = 0
      })

      // Sum up quantities from stock items
      if (stockProducts) {
        stockProducts.forEach((stockItem) => {
          if (categoryQuantities[stockItem.typeId] !== undefined) {
            categoryQuantities[stockItem.typeId] += stockItem.quantity
          }
        })
      }

      // Calculate shopping list with differences
      return baseCategories
        .map((category) => {
          const currentQuantity = categoryQuantities[category.id] || 0
          const desiredQuantity = category.quantityOverride || category.quantity
          const quantityToBuy = Math.max(0, desiredQuantity - currentQuantity)

          return {
            ...category,
            currentQuantity,
            quantityToBuy,
          }
        })
        .filter((item) => item.quantityToBuy > 0)
    }

    it('shows items that need to be purchased (stock < recommended)', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = [{ typeId: 1, quantity: 20 }]

      const result = calculateShoppingList(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].quantityToBuy).toBe(40) // 60 - 20
    })

    it('does not show items when stock >= recommended', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = [{ typeId: 1, quantity: 60 }]

      const result = calculateShoppingList(categories, stock)

      expect(result).toHaveLength(0)
    })

    it('aggregates multiple stock items for same category', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = [
        { typeId: 1, quantity: 20 },
        { typeId: 1, quantity: 15 }, // Total: 35
      ]

      const result = calculateShoppingList(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].currentQuantity).toBe(35)
      expect(result[0].quantityToBuy).toBe(25) // 60 - 35
    })

    it('uses quantityOverride when set', () => {
      const categories = [
        {
          id: 1,
          productType: 'Water',
          quantity: 60,
          quantityOverride: 100, // Override to 100
        },
      ]
      const stock = [{ typeId: 1, quantity: 50 }]

      const result = calculateShoppingList(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].quantityToBuy).toBe(50) // 100 - 50
    })

    it('handles categories with no stock items', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = []

      const result = calculateShoppingList(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].currentQuantity).toBe(0)
      expect(result[0].quantityToBuy).toBe(60)
    })

    it('handles multiple categories with mixed stock levels', () => {
      const categories = [
        { id: 1, productType: 'Water', quantity: 60 },
        { id: 2, productType: 'Rice', quantity: 10 },
        { id: 3, productType: 'Pasta', quantity: 15 },
      ]
      const stock = [
        { typeId: 1, quantity: 60 }, // Full stock
        { typeId: 2, quantity: 3 }, // Need 7 more
        // No stock for Pasta (need 15)
      ]

      const result = calculateShoppingList(categories, stock)

      // Water should not appear (full stock)
      expect(result.find((r) => r.productType === 'Water')).toBeUndefined()

      // Rice should show 7
      const rice = result.find((r) => r.productType === 'Rice')
      expect(rice.quantityToBuy).toBe(7)

      // Pasta should show 15
      const pasta = result.find((r) => r.productType === 'Pasta')
      expect(pasta.quantityToBuy).toBe(15)
    })

    it('handles overstock (stock > recommended)', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = [{ typeId: 1, quantity: 100 }] // Overstock

      const result = calculateShoppingList(categories, stock)

      // Should not appear since Math.max(0, 60-100) = 0
      expect(result).toHaveLength(0)
    })

    it('ignores stock items with unknown typeId', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]
      const stock = [
        { typeId: 1, quantity: 30 },
        { typeId: 999, quantity: 100 }, // Unknown category
      ]

      const result = calculateShoppingList(categories, stock)

      expect(result).toHaveLength(1)
      expect(result[0].quantityToBuy).toBe(30)
    })

    it('handles null stock', () => {
      const categories = [{ id: 1, productType: 'Water', quantity: 60 }]

      const result = calculateShoppingList(categories, null)

      expect(result).toHaveLength(1)
      expect(result[0].quantityToBuy).toBe(60)
    })

    it('handles empty categories', () => {
      const result = calculateShoppingList([], [])
      expect(result).toHaveLength(0)
    })

    describe('quantityOverride edge cases', () => {
      it('uses quantity when quantityOverride is empty string', () => {
        const categories = [
          { id: 1, productType: 'Water', quantity: 60, quantityOverride: '' },
        ]
        const stock = [{ typeId: 1, quantity: 30 }]

        const result = calculateShoppingList(categories, stock)

        expect(result[0].quantityToBuy).toBe(30) // 60 - 30
      })

      it('uses quantity when quantityOverride is 0 (falsy edge case)', () => {
        const categories = [
          { id: 1, productType: 'Water', quantity: 60, quantityOverride: 0 },
        ]
        const stock = [{ typeId: 1, quantity: 30 }]

        const result = calculateShoppingList(categories, stock)

        // BUG: quantityOverride || quantity means 0 is ignored
        // This documents the current behavior (which may be a bug)
        expect(result[0].quantityToBuy).toBe(30) // Uses 60, not 0
      })

      it('uses quantityOverride when set to positive number', () => {
        const categories = [
          { id: 1, productType: 'Water', quantity: 60, quantityOverride: 100 },
        ]
        const stock = [{ typeId: 1, quantity: 30 }]

        const result = calculateShoppingList(categories, stock)

        expect(result[0].quantityToBuy).toBe(70) // 100 - 30
      })
    })
  })
})
