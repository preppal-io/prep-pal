/**
 * Stock utility functions for item matching and updates
 */

/**
 * Check if two stock items match based on their identifying properties
 * @param {Object} stockItem - The stock item to check
 * @param {Object} targetItem - The target item to match against
 * @returns {boolean} True if items match
 */
export const itemsMatch = (stockItem, targetItem) => {
  return (
    stockItem.typeId === targetItem.typeId &&
    stockItem.description === targetItem.description &&
    stockItem.checkedDate === targetItem.checkedDate
  )
}

/**
 * Find a matching item in the stock products array
 * @param {Array} products - The array of stock products
 * @param {Object} targetItem - The item to find
 * @returns {Object|undefined} The matching item or undefined
 */
export const findStockItem = (products, targetItem) => {
  return products.find(item => itemsMatch(item, targetItem))
}

/**
 * Update a single stock item in the products array
 * @param {Object} stock - The current stock object
 * @param {Object} targetItem - The item to update
 * @param {Object} updates - The properties to update
 * @returns {Object} New stock object with updated item
 */
export const updateStockItem = (stock, targetItem, updates) => {
  return {
    ...stock,
    products: stock.products.map(item =>
      itemsMatch(item, targetItem)
        ? { ...item, ...updates }
        : item
    )
  }
}

/**
 * Remove a stock item from the products array
 * @param {Object} stock - The current stock object
 * @param {Object} targetItem - The item to remove
 * @returns {Object} New stock object without the removed item
 */
export const removeStockItem = (stock, targetItem) => {
  return {
    ...stock,
    products: stock.products.filter(item => !itemsMatch(item, targetItem))
  }
}

/**
 * Add a new stock item to the products array
 * @param {Object} stock - The current stock object
 * @param {Object} newItem - The item to add
 * @returns {Object} New stock object with the added item
 */
export const addStockItem = (stock, newItem) => {
  return {
    ...stock,
    products: [...stock.products, newItem]
  }
}
