import { expect, test } from '@playwright/test'

test('home page smoke', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Creative Computing Lab/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('main')).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Creative Computing Lab' }),
  ).toBeVisible()

  await expect(page.getByText('Vite + React')).toHaveCount(0)
  await expect(page.getByText('Click on the logos')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Explore Vite/i })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Learn more/i })).toHaveCount(0)
})
