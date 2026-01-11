import { useMemo } from 'react'
import { isTodayAfter } from '../utils/dateUtils'

/**
 * Custom hook to group and filter stock items by category
 * @param {Object} productData - The product data containing categories and stock
 * @param {string} searchFilter - Search filter text
 * @param {string} categoryType - Category type filter ('all' or specific type)
 * @param {Object} translated - Translation object with unknownCategory key
 * @returns {Object} Grouped and filtered stock items
 */
export function useGroupedStockItems(productData, searchFilter, categoryType, translated) {
  // Group stock items by typeId and include categories with non-zero quantity
  const groupedStockItems = useMemo(() => {
    if (!productData.baseCategories) {
      return []
    }

    // Create a map of all categories with non-zero quantity or override
    const grouped = {}

    // First, add all categories with non-zero quantity or override
    productData.baseCategories.forEach(category => {
      const quantity = category.quantityOverride || category.quantity
      if (quantity > 0) {
        grouped[category.id] = {
          category,
          items: []
        }
      }
    })

    // Then, add stock items to their respective categories
    if (productData.stock && productData.stock.products) {
      productData.stock.products.forEach(item => {
        // If the category doesn't exist yet (could be zero quantity), create it
        if (!grouped[item.typeId]) {
          const category = productData.baseCategories.find(cat => cat.id === item.typeId) ||
            { productType: translated.unknownCategory, id: item.typeId }
          grouped[item.typeId] = {
            category,
            items: []
          }
        }

        // Add the item to its category
        grouped[item.typeId].items.push(item)
      })
    }

    // Calculate total quantity for each category
    Object.values(grouped).forEach(group => {
      group.totalQuantity = group.items.reduce((sum, item) => sum + (item.quantity || 0), 0)

      const categoryQuantity = group.category.quantityOverride || group.category.quantity
      group.stockPercentage = categoryQuantity > 0
        ? Math.round((group.totalQuantity / categoryQuantity) * 100)
        : 100

      // Add a property telling whether the category has stock expired
      group.hasExpired = group.items.some(item => isTodayAfter(item.nextCheck))
    })

    // Convert to array and sort by category id
    return Object.values(grouped).sort((a, b) => a.category.id - b.category.id)
  }, [productData.stock, productData.baseCategories, translated])

  // Filter grouped stock items by category name and type
  const filteredGroupedStockItems = useMemo(() => {
    let result = groupedStockItems

    // Filter by search text
    if (searchFilter.trim()) {
      result = result.filter(group =>
        group.category.productType.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    // Filter by category type (if not 'all')
    // Categories without categoryType are shown in all filter views for backward compatibility
    if (categoryType !== 'all') {
      result = result.filter(group => group.category.categoryType === categoryType)
    }

    return result
  }, [groupedStockItems, searchFilter, categoryType])

  return { groupedStockItems, filteredGroupedStockItems }
}
