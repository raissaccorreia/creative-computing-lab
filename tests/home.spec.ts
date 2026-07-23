import { expect, test } from '@playwright/test'

const STAGES = [
  'Query',
  'Candidates',
  'Filters',
  'Ranking',
  'Recommendations',
] as const

test('home page smoke', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Creative Computing Lab/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('main')).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Creative Computing Lab' }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { level: 2, name: 'Search Flow Explorer' }),
  ).toBeVisible()

  const diagram = page.getByRole('img', {
    name: 'Search flow from query to recommendations',
  })
  await expect(diagram).toBeVisible()

  for (const stage of STAGES) {
    await expect(page.getByText(stage, { exact: true }).first()).toBeVisible()
  }

  await expect(
    page.getByRole('heading', { name: 'Textual equivalent' }),
  ).toBeVisible()
  await expect(
    page.getByText(/The query is interpreted as meaning plus constraints/i),
  ).toBeVisible()

  await expect(page.getByText('Vite + React')).toHaveCount(0)
  await expect(page.getByText('Click on the logos')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Explore Vite/i })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Learn more/i })).toHaveCount(0)
})

test('home has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
})
