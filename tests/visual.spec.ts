import { expect, test } from '@playwright/test'

test.describe('canonical Search Flow Explorer states', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  })

  test('Candidates desktop with a selected resource', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByRole('button', { name: /Select SVG Accessibility Starter Guide/i }).click()
    await expect(page.locator('.search-flow__step-name')).toHaveText('Candidates')

    await expect(page).toHaveScreenshot('candidates-desktop-selected.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })

  test('Filters desktop with a selected removed resource', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByRole('button', { name: /Select An Older SVG Primer for Authors/i }).click()
    await expect(page.getByTestId('resource-explanation')).toContainText(
      'Published before 2024',
    )

    await expect(page).toHaveScreenshot('filters-desktop-removed-selected.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })

  test('Ranking mobile with a selected resource and score', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    for (let index = 0; index < 3; index += 1) {
      await page.getByRole('button', { name: 'Next' }).click()
    }

    await page.getByRole('button', { name: /Select SVG Accessibility Starter Guide/i }).click()
    await expect(page.getByTestId('resource-score')).toBeVisible()

    await expect(page).toHaveScreenshot('ranking-mobile-selected.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })

  test('Recommendations desktop with a selected recommendation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    for (let index = 0; index < 4; index += 1) {
      await page.getByRole('button', { name: 'Next' }).click()
    }

    await page.getByRole('button', { name: /Select SVG Accessibility Starter Guide/i }).click()
    await expect(page.getByTestId('resource-explanation')).toContainText(
      'one explained option',
    )

    await expect(page).toHaveScreenshot('recommendations-desktop-selected.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })
})
