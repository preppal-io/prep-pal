/**
 * Shared test utilities for e2e tests
 */

/**
 * Clear all localStorage data (must be called after navigating to a page)
 */
export async function clearStorage(page) {
  await page.evaluate(() => localStorage.clear())
}

/**
 * Initialize database with given parameters
 * @param {Page} page - Playwright page
 * @param {number} nbPeople - Number of people (1-10, default: 1)
 * @param {number} nbDays - Number of days (7-90, default: 7)
 */
export async function initializeDatabase(page, nbPeople = 1, nbDays = 7) {
  // Navigate first, then clear storage
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await clearStorage(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  // Click init button
  await page.click('button:has-text("Initialize databases")')

  // Wait for modal to appear
  await page.waitForSelector('text=Initialize databases')

  // Fill values if different from defaults
  if (nbPeople !== 1) {
    const peopleInput = page.getByLabel('Number of people in the household')
    await peopleInput.fill(String(nbPeople))
  }
  if (nbDays !== 7) {
    const daysInput = page.getByLabel('Number of days')
    await daysInput.fill(String(nbDays))
  }

  // Submit
  await page.click('button:has-text("Submit")')

  // Wait for table to appear (indicates successful initialization)
  await page.waitForSelector('table')
}

/**
 * Wait for a Mantine notification with specific text
 * @param {Page} page - Playwright page
 * @param {string} text - Text to wait for in notification
 * @param {number} timeout - Timeout in ms (default: 5000)
 */
export async function waitForNotification(page, text, timeout = 5000) {
  await page.waitForSelector(`[data-mantine-notification]:has-text("${text}")`, { timeout })
}

/**
 * Get the count of visible table rows
 * @param {Page} page - Playwright page
 * @returns {Promise<number>} Number of visible rows
 */
export async function getTableRowCount(page) {
  return await page.locator('tbody tr').count()
}

/**
 * Check if localStorage contains the expected keys
 * @param {Page} page - Playwright page
 * @returns {Promise<{categories: boolean, stock: boolean, profile: boolean}>}
 */
export async function checkStorageKeys(page) {
  return await page.evaluate(() => ({
    categories: localStorage.getItem('mystock_product_categories') !== null,
    stock: localStorage.getItem('mystock_stock') !== null,
    profile: localStorage.getItem('mystock_user_profile') !== null
  }))
}

/**
 * Navigate to a specific screen via nav link
 * @param {Page} page - Playwright page
 * @param {'categories' | 'stock' | 'shopping'} screen - Screen to navigate to
 */
export async function navigateTo(page, screen) {
  const links = {
    categories: 'a[href="#/recommended"]',
    stock: 'a[href="#/current"]',
    shopping: 'a[href="#/shopping-list"]'
  }
  await page.click(links[screen])
  await page.waitForLoadState('networkidle')
}
