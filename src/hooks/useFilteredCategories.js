import { useMemo } from 'react'

/**
 * Custom hook to filter categories by search text and category type
 * @param {Array} data - The categories data
 * @param {string} searchFilter - Search filter text
 * @param {string} categoryType - Category type filter ('all' or specific type)
 * @returns {Array} Filtered categories
 */
export function useFilteredCategories(data, searchFilter, categoryType) {
  return useMemo(() => {
    let result = data

    // Filter by search text
    if (searchFilter.trim()) {
      result = result.filter(cat =>
        cat.productType.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    // Filter by category type (if not 'all')
    // Categories without categoryType are shown in all filter views for backward compatibility
    if (categoryType !== 'all') {
      result = result.filter(cat => cat.categoryType === categoryType)
    }

    return result
  }, [data, searchFilter, categoryType])
}
