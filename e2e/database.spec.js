import { test, expect } from '@playwright/test'
import { clearStorage, checkStorageKeys } from './helpers.js'

test.describe('Database Initialization and Deletion', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await clearStorage(page)
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('should initialize database with default parameters', async ({ page }) => {

    // Verify uninitialized state
    await expect(page.getByText('No file found')).toBeVisible()

    // Click initialize button
    await page.getByRole('button', { name: 'Initialize databases' }).click()

    // Verify modal opens with default values
    await expect(page.getByRole('heading', { name: 'Initialize databases' })).toBeVisible()
    const peopleInput = page.getByLabel('Number of people in the household')
    const daysInput = page.getByLabel('Number of days')
    await expect(peopleInput).toHaveValue('1')
    await expect(daysInput).toHaveValue('7')

    // Submit with defaults
    await page.getByRole('button', { name: 'Submit' }).click()

    // Wait for initialization to complete
    await page.waitForSelector('table')

    // Verify initialized state
    await expect(page.getByText('No file found')).not.toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify localStorage has data
    const storageKeys = await checkStorageKeys(page)
    expect(storageKeys.categories).toBe(true)
    expect(storageKeys.stock).toBe(true)
  })

  test('should initialize database with custom parameters', async ({ page }) => {

    // Click initialize button
    await page.getByRole('button', { name: 'Initialize databases' }).click()

    // Set custom values
    const peopleInput = page.getByLabel('Number of people in the household')
    const daysInput = page.getByLabel('Number of days')

    await peopleInput.fill('4')
    await daysInput.fill('60')

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click()

    // Wait for initialization
    await page.waitForSelector('table')

    // Verify table has categories
    const rowCount = await page.locator('tbody tr').count()
    expect(rowCount).toBeGreaterThan(0)

    // Verify localStorage has data with custom params
    // Data format is { baseCategories: [...] }
    const storageData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('mystock_product_categories') || '{}')
    })
    expect(storageData.baseCategories).toBeDefined()
    expect(storageData.baseCategories.length).toBeGreaterThan(0)
  })

  test('should delete database after confirmation', async ({ page }) => {
    // First initialize
    await page.getByRole('button', { name: 'Initialize databases' }).click()
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForSelector('table')

    // Verify initialized state
    await expect(page.locator('table')).toBeVisible()
    let storageKeys = await checkStorageKeys(page)
    expect(storageKeys.categories).toBe(true)

    // Find the reset button - it's the second button with an SVG in the header group
    // The header has: Add button (Plus), Reset button (StackMinus)
    const headerButtons = page.locator('button').filter({ has: page.locator('svg') })
    // Get the last button in the header area which should be the reset button
    const resetButton = page.locator('h1').locator('..').locator('button').filter({ has: page.locator('svg') }).last()
    await resetButton.click()

    // Verify first click shows confirmation state - a Cancel button should appear
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()

    // Click reset button again to confirm
    await resetButton.click()

    // Wait for deletion
    await page.waitForSelector('text=No file found')

    // Verify deleted state
    await expect(page.getByText('No file found')).toBeVisible()
    await expect(page.locator('table')).not.toBeVisible()

    // Verify localStorage is cleared
    storageKeys = await checkStorageKeys(page)
    expect(storageKeys.categories).toBe(false)
    expect(storageKeys.stock).toBe(false)
  })

  test('should cancel database deletion', async ({ page }) => {
    // First initialize
    await page.getByRole('button', { name: 'Initialize databases' }).click()
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForSelector('table')

    // Find and click reset button once
    const resetButton = page.locator('h1').locator('..').locator('button').filter({ has: page.locator('svg') }).last()
    await resetButton.click()

    // Cancel button should appear
    const cancelButton = page.getByRole('button', { name: 'Cancel' })
    await expect(cancelButton).toBeVisible()

    // Click cancel
    await cancelButton.click()

    // Cancel button should disappear
    await expect(cancelButton).not.toBeVisible()

    // Table should still be visible
    await expect(page.locator('table')).toBeVisible()

    // Data should still exist
    const storageKeys = await checkStorageKeys(page)
    expect(storageKeys.categories).toBe(true)
  })
})
