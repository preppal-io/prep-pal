import { test, expect } from '@playwright/test'

test.describe('PrepPal App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')

    // Wait for the app to load
    await page.waitForLoadState('networkidle')

    // Check that the page title is correct
    await expect(page).toHaveTitle('PrepPal')
  })

  test('should display navigation', async ({ page }) => {
    await page.goto('/')

    // Wait for the app to load
    await page.waitForLoadState('networkidle')

    // Check for navigation elements (using Mantine NavLink structure)
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})
