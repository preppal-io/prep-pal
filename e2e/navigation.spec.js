import { test, expect } from '@playwright/test'
import { initializeDatabase } from './helpers.js'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await initializeDatabase(page)
  })

  test('should navigate to Manage Stock screen', async ({ page }) => {
    // Start on categories screen (default after init)
    await expect(page.locator('table')).toBeVisible()

    // Click Manage stock nav link
    await page.click('a[href="#/current"]')
    await page.waitForLoadState('networkidle')

    // Verify URL
    await expect(page).toHaveURL(/#\/current/)

    // Verify screen content (Current stock screen has different title)
    await expect(page.getByRole('heading', { name: 'Current stock' })).toBeVisible()
  })

  test('should navigate to Shopping List screen', async ({ page }) => {
    // Click Shopping list nav link
    await page.click('a[href="#/shopping-list"]')
    await page.waitForLoadState('networkidle')

    // Verify URL
    await expect(page).toHaveURL(/#\/shopping-list/)

    // Verify screen content
    await expect(page.getByRole('heading', { name: 'Shopping list' })).toBeVisible()
  })

  test('should navigate to Categories screen from another screen', async ({ page }) => {
    // First navigate away from categories
    await page.click('a[href="#/current"]')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/#\/current/)

    // Navigate back to categories
    await page.click('a[href="#/recommended"]')
    await page.waitForLoadState('networkidle')

    // Verify URL contains /recommended
    await expect(page).toHaveURL(/#\/recommended/)

    // Verify screen content
    await expect(page.getByRole('heading', { name: 'Recommended categories' })).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('should show active state on current nav link', async ({ page }) => {
    // First navigate to a known route to ensure we're on categories
    await page.click('a[href="#/recommended"]')
    await page.waitForLoadState('networkidle')

    // Check categories nav link is active
    const categoriesLink = page.locator('a[href="#/recommended"]')
    // Mantine NavLink sets data-active when active prop is true
    await expect(categoriesLink).toHaveAttribute('data-active', 'true')

    // Navigate to stock and check active state changes
    await page.click('a[href="#/current"]')
    await page.waitForLoadState('networkidle')

    const stockLink = page.locator('a[href="#/current"]')
    await expect(stockLink).toHaveAttribute('data-active', 'true')
    // Categories link should no longer be active
    await expect(categoriesLink).not.toHaveAttribute('data-active', 'true')

    // Navigate to shopping list and check active state
    await page.click('a[href="#/shopping-list"]')
    await page.waitForLoadState('networkidle')

    const shoppingLink = page.locator('a[href="#/shopping-list"]')
    await expect(shoppingLink).toHaveAttribute('data-active', 'true')
    await expect(stockLink).not.toHaveAttribute('data-active', 'true')
  })
})
