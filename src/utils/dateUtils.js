/**
 * Date utility functions for working with dates in yyyy-mm-dd format
 */

/**
 * Parse a date string in yyyy-mm-dd format to a Date object
 * @param {string} dateString - Date string in yyyy-mm-dd format
 * @returns {Date} JavaScript Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null
  
  // Split the date string by '-' and convert to numbers
  const [year, month, day] = dateString.split('-').map(Number)
  
  // Create a new Date object (month is 0-indexed in JavaScript)
  return new Date(year, month - 1, day)
}

/**
 * Format a Date object to yyyy-mm-dd string
 * @param {Date} date - JavaScript Date object
 * @returns {string} Date string in yyyy-mm-dd format
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return ''
  
  const year = date.getFullYear()
  // Add 1 to month since it's 0-indexed and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0')
  // Pad day with leading zero if needed
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get today's date as a yyyy-mm-dd string
 * @returns {string} Today's date in yyyy-mm-dd format
 */
export const getTodayFormatted = () => {
  return formatDate(new Date())
}

/**
 * Get today's date as a yyyy-mm-dd string using ISO string format
 * This is an alternative to getTodayFormatted that uses the ISO string method
 * @returns {string} Today's date in yyyy-mm-dd format
 */
export const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if today is after a specified date
 * @param {string} dateString - Date string in yyyy-mm-dd format
 * @returns {boolean} True if today is after the specified date, false otherwise
 */
export const isTodayAfter = (dateString) => {
  if (!dateString) return false
  
  const today = new Date()
  // Reset time to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0)
  
  const compareDate = parseDate(dateString)
  if (!compareDate) return false
  
  return today > compareDate
}

/**
 * Add days to a date
 * @param {string|Date} date - Date string in yyyy-mm-dd format or Date object
 * @param {number} days - Number of days to add (can be negative to subtract days)
 * @returns {string} Resulting date in yyyy-mm-dd format
 */
export const addDays = (date, days) => {
  if (!date) return ''
  
  // Convert to Date object if it's a string
  const dateObj = date instanceof Date ? date : parseDate(date)
  if (!dateObj) return ''
  
  // Create a new date to avoid modifying the original
  const newDate = new Date(dateObj)
  newDate.setDate(newDate.getDate() + days)
  
  return formatDate(newDate)
}
