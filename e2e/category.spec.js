import { test, expect } from '@playwright/test'
import { initializeDatabase, getTableRowCount } from './helpers.js'

test.describe('Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await initializeDatabase(page)
  })

  test('should add a new category', async ({ page }) => {
    const initialRowCount = await getTableRowCount(page)

    // Click add button - it's in the header area, near the h1 title
    // Find button that contains a Plus icon SVG - it's the first button in the header controls
    const headerArea = page.locator('h1').locator('..')
    const addButton = headerArea.locator('button').first()
    await addButton.click()

    // Wait for modal to open - look for the modal dialog
    await page.waitForSelector('[role="dialog"]')
    await expect(page.locator('[role="dialog"]')).toContainText('Add new category')

    // Fill form fields
    await page.getByLabel('Product type').fill('E2E Test Category')
    // Category type is a select - use the textbox role to be more specific
    await page.getByRole('textbox', { name: 'Category type' }).click()
    await page.getByRole('option', { name: 'Food' }).click()
    await page.getByLabel('Description and examples').fill('Test description for e2e')
    await page.getByLabel('Recommended quantity').fill('10')

    // Click save
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Save' }).click()

    // Wait for modal to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Wait a moment for the save operation to complete
    await page.waitForTimeout(500)

    // Verify new category appears in table (this is the definitive proof of success)
    await expect(page.getByText('E2E Test Category')).toBeVisible()

    // Verify row count increased
    const newRowCount = await getTableRowCount(page)
    expect(newRowCount).toBe(initialRowCount + 1)
  })

  test('should delete a category', async ({ page }) => {
    const initialRowCount = await getTableRowCount(page)

    // Get the first category name (second column - first is icon column)
    const firstRow = page.locator('tbody tr').first()
    const categoryName = await firstRow.locator('td').nth(1).textContent()

    // Find all action buttons in the row - they are in a Group at the end
    // The buttons are: ShoppingCart (may be disabled), Pencil, Trash
    // We need the last button (Trash icon)
    const actionButtons = firstRow.locator('td').last().locator('button')
    const deleteButton = actionButtons.last()
    await deleteButton.click()

    // Wait a moment for the action to process
    await page.waitForTimeout(500)

    // Verify category is removed from table (second column - first is icon column)
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).not.toHaveText(categoryName)

    // Verify row count decreased
    const newRowCount = await getTableRowCount(page)
    expect(newRowCount).toBe(initialRowCount - 1)
  })

  test('should filter categories by text', async ({ page }) => {
    const initialRowCount = await getTableRowCount(page)

    // Get a category name to search for (partial match) - second column, first is icon
    const firstRow = page.locator('tbody tr').first()
    const categoryName = await firstRow.locator('td').nth(1).textContent()
    const searchTerm = categoryName.substring(0, 4).toLowerCase()

    // Type in search input
    await page.getByPlaceholder('Search category...').fill(searchTerm)

    // Wait for filter to apply
    await page.waitForTimeout(200)

    // Verify filtered results (should have fewer or equal rows)
    const filteredRowCount = await getTableRowCount(page)
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount)
    expect(filteredRowCount).toBeGreaterThan(0)

    // Verify all visible rows contain the search term (second column, first is icon)
    const visibleRows = page.locator('tbody tr')
    const count = await visibleRows.count()
    for (let i = 0; i < count; i++) {
      const rowText = await visibleRows.nth(i).locator('td').nth(1).textContent()
      expect(rowText.toLowerCase()).toContain(searchTerm)
    }

    // Clear search
    await page.getByPlaceholder('Search category...').clear()

    // Verify all rows visible again
    await page.waitForTimeout(200)
    const clearedRowCount = await getTableRowCount(page)
    expect(clearedRowCount).toBe(initialRowCount)
  })

  test('should filter categories by type', async ({ page }) => {
    const initialRowCount = await getTableRowCount(page)

    // Click Food segment - find label containing the text within SegmentedControl
    await page.locator('.mantine-SegmentedControl-label:has-text("Food")').click()
    await page.waitForTimeout(200)

    const foodRowCount = await getTableRowCount(page)
    expect(foodRowCount).toBeLessThanOrEqual(initialRowCount)

    // Click Consumable segment
    await page.locator('.mantine-SegmentedControl-label:has-text("Consumable")').click()
    await page.waitForTimeout(200)

    const consumableRowCount = await getTableRowCount(page)
    expect(consumableRowCount).toBeLessThanOrEqual(initialRowCount)

    // Click Equipment segment
    await page.locator('.mantine-SegmentedControl-label:has-text("Equipment")').click()
    await page.waitForTimeout(200)

    const equipmentRowCount = await getTableRowCount(page)
    expect(equipmentRowCount).toBeLessThanOrEqual(initialRowCount)

    // Click All segment - use exact match to avoid matching "Consumable" etc.
    await page.locator('.mantine-SegmentedControl-label').filter({ hasText: /^All$/ }).click()
    await page.waitForTimeout(200)

    const allRowCount = await getTableRowCount(page)
    expect(allRowCount).toBe(initialRowCount)

    // Verify the sum of filtered counts roughly equals total
    expect(foodRowCount + consumableRowCount + equipmentRowCount).toBeLessThanOrEqual(initialRowCount)
  })

  test('should change category quantity', async ({ page }) => {
    // Find a quantity input in the first row
    const firstRow = page.locator('tbody tr').first()
    const quantityInput = firstRow.locator('input').first()

    // Get original value
    const originalValue = await quantityInput.inputValue()
    const newValue = String(parseInt(originalValue || '0') + 5)

    // Change the value
    await quantityInput.clear()
    await quantityInput.fill(newValue)

    // Click outside to trigger blur/debounce
    await page.locator('h1').click()

    // Wait for debounce + save (500ms + network)
    await page.waitForTimeout(1000)

    // Reload page to verify persistence
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Find the same row and verify value persisted
    const reloadedFirstRow = page.locator('tbody tr').first()
    const reloadedQuantityInput = reloadedFirstRow.locator('input').first()
    await expect(reloadedQuantityInput).toHaveValue(newValue)
  })

  test('should edit category via edit popup', async ({ page }) => {
    // Get first category name (second column - first is icon column)
    const firstRow = page.locator('tbody tr').first()
    const categoryName = await firstRow.locator('td').nth(1).textContent()

    // Click edit button - it's the second-to-last button (Pencil icon)
    const actionButtons = firstRow.locator('td').last().locator('button')
    // Order: ShoppingCart (index 0), Pencil (index 1), Trash (index 2)
    await actionButtons.nth(1).click()

    // Verify modal opens - check for dialog containing the category name
    await page.waitForSelector('[role="dialog"]')
    await expect(page.locator('[role="dialog"]')).toContainText(categoryName)

    // Make sure categoryType is selected (required for Save to be enabled)
    // Category type is a select - use the textbox role to be more specific
    const categoryTypeSelect = page.getByRole('textbox', { name: 'Category type' })
    const currentValue = await categoryTypeSelect.inputValue()
    if (!currentValue) {
      await categoryTypeSelect.click()
      await page.getByRole('option', { name: 'Food' }).click()
    }

    // Change description
    const descInput = page.getByLabel('Description')
    await descInput.clear()
    await descInput.fill('Updated description via e2e test')

    // Click save
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Save' }).click()

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Verify description updated in table
    await expect(page.getByText('Updated description via e2e test')).toBeVisible()
  })

  test('should open edit modal via double-click', async ({ page }) => {
    // Get first category name (second column - first is icon column)
    const firstRow = page.locator('tbody tr').first()
    const categoryName = await firstRow.locator('td').nth(1).textContent()

    // Double-click the row
    await firstRow.dblclick()

    // Verify edit modal opens - dialog should contain category name
    await page.waitForSelector('[role="dialog"]')
    await expect(page.locator('[role="dialog"]')).toContainText(categoryName)

    // Close with Cancel
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' }).click()

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should apply combined filters (text + type)', async ({ page }) => {
    // First apply type filter - find label containing the text
    await page.locator('.mantine-SegmentedControl-label:has-text("Food")').click()
    await page.waitForTimeout(200)

    const foodRowCount = await getTableRowCount(page)

    // Get a food category name to search (second column - first is icon column)
    if (foodRowCount > 0) {
      const firstFoodRow = page.locator('tbody tr').first()
      const categoryName = await firstFoodRow.locator('td').nth(1).textContent()
      const searchTerm = categoryName.substring(0, 3).toLowerCase()

      // Apply text filter on top of type filter
      await page.getByPlaceholder('Search category...').fill(searchTerm)
      await page.waitForTimeout(200)

      const combinedRowCount = await getTableRowCount(page)
      expect(combinedRowCount).toBeLessThanOrEqual(foodRowCount)

      // Clear text filter
      await page.getByPlaceholder('Search category...').clear()
      await page.waitForTimeout(200)

      // Should show all Food categories again
      const afterClearRowCount = await getTableRowCount(page)
      expect(afterClearRowCount).toBe(foodRowCount)
    }

    // Reset type filter to All
    await page.locator('.mantine-SegmentedControl-label').filter({ hasText: /^All$/ }).click()
  })

  test('should cancel add modal without saving', async ({ page }) => {
    const initialRowCount = await getTableRowCount(page)

    // Open add modal - find button in header area
    const headerArea = page.locator('h1').locator('..')
    await headerArea.locator('button').first().click()
    await page.waitForSelector('[role="dialog"]')

    // Fill some fields
    await page.getByLabel('Product type').fill('Should Not Be Added')

    // Click cancel
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' }).click()

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Verify no new category added
    const newRowCount = await getTableRowCount(page)
    expect(newRowCount).toBe(initialRowCount)
    await expect(page.getByText('Should Not Be Added')).not.toBeVisible()
  })

  test('should cancel edit modal without saving', async ({ page }) => {
    // Get first category's original description
    const firstRow = page.locator('tbody tr').first()
    const originalDescription = await firstRow.locator('td').nth(1).textContent()

    // Open edit modal via edit button
    const actionButtons = firstRow.locator('td').last().locator('button')
    await actionButtons.nth(1).click()
    await page.waitForSelector('[role="dialog"]')

    // Change description
    const descInput = page.getByLabel('Description')
    await descInput.clear()
    await descInput.fill('This change should not be saved')

    // Click cancel
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' }).click()

    // Verify original description is still shown
    const currentDescription = await firstRow.locator('td').nth(1).textContent()
    expect(currentDescription).toBe(originalDescription)
  })

  test('should disable save button when product type is empty', async ({ page }) => {
    // Open add modal - find button in header area
    const headerArea = page.locator('h1').locator('..')
    await headerArea.locator('button').first().click()
    await page.waitForSelector('[role="dialog"]')

    // Verify save button is disabled when product type is empty
    const saveButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Save' })
    await expect(saveButton).toBeDisabled()

    // Fill product type
    await page.getByLabel('Product type').fill('Test')

    // Verify save button is now enabled
    await expect(saveButton).toBeEnabled()

    // Clear product type
    await page.getByLabel('Product type').clear()

    // Verify save button is disabled again
    await expect(saveButton).toBeDisabled()

    // Close modal
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' }).click()
  })

  test('should show empty state when filter has no matches', async ({ page }) => {
    // Type a search term that definitely won't match
    await page.getByPlaceholder('Search category...').fill('xyznonexistent123')
    await page.waitForTimeout(200)

    // Verify no rows visible
    const rowCount = await getTableRowCount(page)
    expect(rowCount).toBe(0)

    // Clear search to restore
    await page.getByPlaceholder('Search category...').clear()
  })
})
