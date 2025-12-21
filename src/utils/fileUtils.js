// Import the template data with all languages for fallback in web browser environment
import productCategoriesTemplate from '../data/productCategories_template.json'
import defaultStock from '../data/stock.json'
import { isElectron } from './browserUtils'

// Function to get product categories for a specific locale
// computeQuantityFunc should be a function accepting: the recommended daily qty for an adult, the number of people, and the number of days.
const getLocalizedProductCategories = (locale = 'en_US', computeQuantityFunc = () => 1) => {
  // Create a deep copy of the template
  const localizedData = JSON.parse(JSON.stringify(productCategoriesTemplate))
  
  // Transform each category to use the specified locale and compute the recommended quantity
  localizedData.baseCategories = localizedData.baseCategories.map(category => {
    return {
      //...category,
      id: category.id,
      onlineShopLink: category.onlineShopLink,
      usualExpiryCheckDays: category.usualExpiryCheckDays,
      quantityOverride: "",
      recommendedQtyDayAdult: category.recommendedQtyDayAdult,

      productType: category.productType[locale] || category.productType['en_US'],
      description: category.description[locale] || category.description['en_US'],
      defaultUnit: category.defaultUnit ? (category.defaultUnit[locale] || category.defaultUnit['en_US']) : undefined,
      // that's where we could compute the final quantity
      quantity: computeQuantityFunc(category)
    }
  })
  
  return localizedData
}

// Local storage keys
const PRODUCT_CATEGORIES_STORAGE_KEY = 'mystock_product_categories'
const STOCK_STORAGE_KEY = 'mystock_stock'
const USER_PROFILE_STORAGE_KEY = 'mystock_user_profile'

/**
 * Check if product categories file exists
 * * To know if the stock file exists, it checks if the file returns anything, and if it has any keys
 * @returns {Promise<boolean>} True if the file exists
 */
export const checkProductCategoriesExist = async () => {
  try {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      const data = await ipcRenderer.invoke('read-product-categories')
      return data && Object.keys(data).length > 0
    } else {
      const storedData = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY)
      return !!storedData
    }
  } catch (error) {
    console.warn('Product categories file does not exist')
    return false
  }
}

/**
 * Check if stock file exists
 * To know if the stock file exists, it checks if the file returns anything, and if it has any keys
 * @returns {Promise<boolean>} True if the file exists
 */
export const checkStockExists = async () => {
  try {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      const data = await ipcRenderer.invoke('read-stock')
      return data && Object.keys(data).length > 0
    } else {
      const storedData = localStorage.getItem(STOCK_STORAGE_KEY)
      return !!storedData
    }
  } catch (error) {
    console.warn('Stock file does not exist')
    return false
  }
}

/**
 * Read product categories from disk using Electron IPC or localStorage in browser
 * @returns {Promise<Object>} The product categories data
 * @throws {Error} If the file doesn't exist or can't be read
 */
export const readProductCategories = async () => {
  try {
    // If running in Electron, use IPC to read from disk
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      try {
        const data = await ipcRenderer.invoke('read-product-categories')
        
        // Check if data exists and is valid
        if (!data || Object.keys(data).length === 0) {
          throw new Error('No product categories data found')
        }
        
        return data
      } catch (ipcError) {
        console.error('Error with Electron IPC:', ipcError)
        throw new Error('Failed to read product categories file')
      }
    } else {
      // In browser, try to get from localStorage
      const storedData = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY)
      
      if (storedData) {
        console.log('Reading data from localStorage')
        return JSON.parse(storedData)
      } else {
        throw new Error('No product categories data found in localStorage')
      }
    }
  } catch (error) {
    console.error('Error reading product categories:', error)
    throw error
  }
}

/**
 * Write product categories to disk using Electron IPC or localStorage in browser
 * @param {Object} data - The product categories data to write
 * @returns {Promise<boolean>} True if successful
 */
export const writeProductCategories = async (data) => {
  try {
    // If running in Electron, use IPC to write to disk
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      return await ipcRenderer.invoke('write-product-categories', data)
    } else {
      // In browser, save to localStorage
      console.log('Saving data to localStorage')
      localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(data))
      return true
    }
  } catch (error) {
    console.error('Error writing product categories:', error)
    throw error
  }
}

/**
 * Read stock data from disk using Electron IPC or localStorage in browser
 * @returns {Promise<Object>} The stock data
 * @throws {Error} If the file doesn't exist or can't be read
 */
export const readStock = async () => {
  try {
    // If running in Electron, use IPC to read from disk
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      try {
        const data = await ipcRenderer.invoke('read-stock')
        
        // Check if data exists and is valid
        if (!data || Object.keys(data).length === 0) {
          throw new Error('No stock data found')
        }
        
        return data
      } catch (ipcError) {
        console.error('Error with Electron IPC:', ipcError)
        throw new Error('Failed to read stock file')
      }
    } else {
      // In browser, try to get from localStorage
      const storedData = localStorage.getItem(STOCK_STORAGE_KEY)
      
      if (storedData) {
        console.log('Reading stock data from localStorage')
        return JSON.parse(storedData)
      } else {
        throw new Error('No stock data found in localStorage')
      }
    }
  } catch (error) {
    console.error('Error reading stock data:', error)
    throw error
  }
}

/**
 * Write stock data to disk using Electron IPC or localStorage in browser
 * @param {Object} data - The stock data to write
 * @returns {Promise<boolean>} True if successful
 */
export const writeStock = async (data) => {
  try {
    // If running in Electron, use IPC to write to disk
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      return await ipcRenderer.invoke('write-stock', data)
    } else {
      // In browser, save to localStorage
      console.log('Saving stock data to localStorage')
      localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(data))
      return true
    }
  } catch (error) {
    console.error('Error writing stock data:', error)
    throw error
  }
}

/**
 * Delete product categories file
 * @returns {Promise<boolean>} True if successful
 */
export const deleteProductCategories = async () => {
  try {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      return await ipcRenderer.invoke('delete-product-categories')
    } else {
      localStorage.removeItem(PRODUCT_CATEGORIES_STORAGE_KEY)
      return true
    }
  } catch (error) {
    console.error('Error deleting product categories:', error)
    throw error
  }
}

/**
 * Delete stock file
 * @returns {Promise<boolean>} True if successful
 */
export const deleteStock = async () => {
  try {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      return await ipcRenderer.invoke('delete-stock')
    } else {
      localStorage.removeItem(STOCK_STORAGE_KEY)
      return true
    }
  } catch (error) {
    console.error('Error deleting stock:', error)
    throw error
  }
}

/**
 * Delete all database files
 * @returns {Promise<boolean>} True if successful
 */
export const deleteDatabases = async () => {
  try {
    await deleteProductCategories()
    await deleteStock()
    return true
  } catch (error) {
    console.error('Error deleting databases:', error)
    throw error
  }
}

/**
 * Initialize databases with locale-specific data
 * @param {string} locale - The locale to use (e.g., 'en_US', 'fr_CH', 'de_CH')
 * @returns {Promise<boolean>} True if successful
 */
export const initializeDatabases = async (locale = 'en_US', nbPeople = 1, nbDays = 30) => {
  try {

    const quantityFunction = (category, forPeople, forDays) => {
      const people = category.functionOfPeople === "yes" ? forPeople : 1
      const days = category.functionOfDays === "yes" ? forDays : 1
      
      return Math.ceil(people * days * category.quantityMultiplier || 0)
    }

    const quantityCalculator = category => quantityFunction(category, nbPeople, nbDays)

    // Get the product categories for the specified locale
    const productCategories = getLocalizedProductCategories(locale, quantityCalculator)
    
    await writeProductCategories(productCategories)
    await writeStock(defaultStock)
    return true
  } catch (error) {
    console.error('Error initializing databases:', error)
    throw error
  }
}

/**
 * Read user profile from disk using Electron IPC or localStorage in browser
 * @returns {Promise<Object>} The user profile data
 * @throws {Error} If the file doesn't exist or can't be read
 */
export const readUserProfile = async () => {
  try {
    // If running in Electron, use IPC to read from disk
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      try {
        const data = await ipcRenderer.invoke('read-user-profile')
        
        // Check if data exists and is valid
        if (!data || Object.keys(data).length === 0) {
          throw new Error('No user profile data found')
        }
        
        return data
      } catch (ipcError) {
        console.error('Error with Electron IPC:', ipcError)
        throw new Error('Failed to read user profile file')
      }
    } else {
      // In browser, try to get from localStorage
      const storedData = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
      
      if (storedData) {
        console.log('Reading user profile from localStorage')
        return JSON.parse(storedData)
      } else {
        throw new Error('No user profile found in localStorage')
      }
    }
  } catch (error) {
    console.error('Error reading user profile:', error)
    throw error
  }
}

/**
 * Write user profile to disk using Electron IPC or localStorage in browser
 * @param {Object} data - The user profile data to write
 * @returns {Promise<boolean>} True if successful
 */
export const writeUserProfile = async (data) => {
  try {
    // If running in Electron, use IPC to write to disk
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      return await ipcRenderer.invoke('write-user-profile', data)
    } else {
      // In browser, save to localStorage
      console.log('Saving user profile to localStorage')
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(data))
      return true
    }
  } catch (error) {
    console.error('Error writing user profile:', error)
    throw error
  }
}
