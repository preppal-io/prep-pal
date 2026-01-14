import { test, expect } from '@playwright/test'
import { initializeDatabase, navigateTo } from './helpers.js'

test.describe('Scroll Position Preservation', () => {
  test.beforeEach(async ({ page }) => {
    // Initialize with more data to ensure scrolling is needed
    await initializeDatabase(page, 4, 60)
  })

  test.describe('Category Screen', () => {
    test('should preserve scroll position when editing a category via edit popup', async ({ page }) => {
      // Ensure we're on the categories page
      await navigateTo(page, 'categories')
      await page.waitForSelector('table')

      // Get the table and scroll down to find a row that's not initially visible
      const tableRows = page.locator('tbody tr')
      const rowCount = await tableRows.count()

      // Skip if not enough rows to scroll
      if (rowCount < 5) {
        test.skip()
        return
      }

      // Scroll to a row near the middle/bottom of the table
      const targetRowIndex = Math.floor(rowCount / 2)
      const targetRow = tableRows.nth(targetRowIndex)
      await targetRow.scrollIntoViewIfNeeded()

      // Wait for scroll to settle
      await page.waitForTimeout(100)

      // Get the scroll position before opening the modal
      const scrollPositionBefore = await page.evaluate(() => window.scrollY)

      // Ensure we actually scrolled
      expect(scrollPositionBefore).toBeGreaterThan(0)

      // Get the category name for verification (second column - first is icon column)
      const categoryName = await targetRow.locator('td').nth(1).textContent()

      // Click edit button on the target row (second-to-last button)
      const actionButtons = targetRow.locator('td').last().locator('button')
      await actionButtons.nth(1).click()

      // Wait for modal to open
      await page.waitForSelector('[role="dialog"]')
      await expect(page.locator('[role="dialog"]')).toContainText(categoryName)

      // Make sure categoryType is selected (required for Save to be enabled)
      const categoryTypeSelect = page.getByRole('textbox', { name: 'Category type' })
      const currentValue = await categoryTypeSelect.inputValue()
      if (!currentValue) {
        await categoryTypeSelect.click()
        await page.getByRole('option', { name: 'Food' }).click()
      }

      // Make a small change to trigger save
      const descInput = page.getByLabel('Description')
      const originalDesc = await descInput.inputValue()
      await descInput.clear()
      await descInput.fill(originalDesc + ' (edited)')

      // Save the changes
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Save' }).click()

      // Wait for modal to close
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()

      // Wait for data save and potential re-render
      await page.waitForTimeout(500)

      // Verify scroll position is preserved
      const scrollPositionAfter = await page.evaluate(() => window.scrollY)

      // Allow some tolerance for scroll position (within 50px)
      expect(Math.abs(scrollPositionAfter - scrollPositionBefore)).toBeLessThan(50)
    })

    test('should preserve scroll position when canceling edit modal', async ({ page }) => {
      // Ensure we're on the categories page
      await navigateTo(page, 'categories')
      await page.waitForSelector('table')

      // Get the table and scroll down
      const tableRows = page.locator('tbody tr')
      const rowCount = await tableRows.count()

      if (rowCount < 5) {
        test.skip()
        return
      }

      // Scroll to a row near the bottom
      const targetRowIndex = Math.floor(rowCount / 2)
      const targetRow = tableRows.nth(targetRowIndex)
      await targetRow.scrollIntoViewIfNeeded()
      await page.waitForTimeout(100)

      // Get scroll position before
      const scrollPositionBefore = await page.evaluate(() => window.scrollY)
      expect(scrollPositionBefore).toBeGreaterThan(0)

      // Open edit modal via double-click
      await targetRow.dblclick()
      await page.waitForSelector('[role="dialog"]')

      // Cancel without making changes
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' }).click()
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()

      // Verify scroll position is preserved
      const scrollPositionAfter = await page.evaluate(() => window.scrollY)
      expect(Math.abs(scrollPositionAfter - scrollPositionBefore)).toBeLessThan(50)
    })
  })

  test.describe('Stock Screen', () => {
    test('should preserve scroll position when adding a stock item', async ({ page }) => {
      // Navigate to stock screen
      await navigateTo(page, 'stock')
      await page.waitForSelector('table')

      // Get the table rows (categories and items mixed)
      const tableRows = page.locator('tbody tr')
      const rowCount = await tableRows.count()

      if (rowCount < 5) {
        test.skip()
        return
      }

      // Find a category row (has an Add button) near the middle/bottom
      // Category rows have a "+" button in them
      const categoryRows = page.locator('tbody tr').filter({ has: page.locator('button svg') })
      const categoryCount = await categoryRows.count()

      if (categoryCount < 2) {
        test.skip()
        return
      }

      // Scroll to a category row near the middle
      const targetCategoryIndex = Math.floor(categoryCount / 2)
      const targetCategoryRow = categoryRows.nth(targetCategoryIndex)
      await targetCategoryRow.scrollIntoViewIfNeeded()
      await page.waitForTimeout(100)

      // Get scroll position before
      const scrollPositionBefore = await page.evaluate(() => window.scrollY)
      expect(scrollPositionBefore).toBeGreaterThan(0)

      // Find and click the add button on this category row
      const addButton = targetCategoryRow.locator('button').first()
      await addButton.click()

      // Wait for modal to open
      await page.waitForSelector('[role="dialog"]')

      // Fill in required fields to add item
      await page.getByLabel('Product name').fill('E2E Test Item')
      await page.getByLabel('Quantity').fill('5')

      // Save
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Save' }).click()

      // Wait for modal to close and save to complete
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
      await page.waitForTimeout(500)

      // Verify scroll position is preserved
      const scrollPositionAfter = await page.evaluate(() => window.scrollY)
      expect(Math.abs(scrollPositionAfter - scrollPositionBefore)).toBeLessThan(50)
    })

    test('should preserve scroll position when canceling add stock item modal', async ({ page }) => {
      // Navigate to stock screen
      await navigateTo(page, 'stock')
      await page.waitForSelector('table')

      // Find category rows
      const categoryRows = page.locator('tbody tr').filter({ has: page.locator('button svg') })
      const categoryCount = await categoryRows.count()

      if (categoryCount < 2) {
        test.skip()
        return
      }

      // Scroll to a category row near the middle
      const targetCategoryIndex = Math.floor(categoryCount / 2)
      const targetCategoryRow = categoryRows.nth(targetCategoryIndex)
      await targetCategoryRow.scrollIntoViewIfNeeded()
      await page.waitForTimeout(100)

      // Get scroll position before
      const scrollPositionBefore = await page.evaluate(() => window.scrollY)
      expect(scrollPositionBefore).toBeGreaterThan(0)

      // Click add button
      const addButton = targetCategoryRow.locator('button').first()
      await addButton.click()

      // Wait for modal to open
      await page.waitForSelector('[role="dialog"]')

      // Cancel without making changes
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' }).click()
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()

      // Verify scroll position is preserved
      const scrollPositionAfter = await page.evaluate(() => window.scrollY)
      expect(Math.abs(scrollPositionAfter - scrollPositionBefore)).toBeLessThan(50)
    })
  })
})
