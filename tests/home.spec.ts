import { expect, test } from '@playwright/test'

const STAGES = [
  'Query',
  'Candidates',
  'Filters',
  'Ranking',
  'Recommendations',
] as const

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

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
    name: /Search flow diagram, step 1 of 5: Query/i,
  })
  await expect(diagram).toBeVisible()

  for (const stage of STAGES) {
    await expect(page.getByText(stage, { exact: true }).first()).toBeVisible()
  }

  await expect(
    page.getByRole('heading', { name: 'Textual equivalent' }),
  ).toBeVisible()
  await expect(
    page.getByText(/The query is interpreted as meaning plus constraints/i).first(),
  ).toBeVisible()

  await expect(page.getByText('Vite + React')).toHaveCount(0)
})

test('search flow stage navigation and snapshots', async ({ page }) => {
  await page.goto('/')

  const previous = page.getByRole('button', { name: 'Previous' })
  const next = page.getByRole('button', { name: 'Next' })

  await expect(previous).toBeDisabled()
  await expect(next).toBeEnabled()
  await expect(page.locator('.search-flow__step-count')).toHaveText('1 of 5')
  await expect(page.locator('.search-flow__live')).toContainText('Step 1 of 5: Query')

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('2 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 2 of 5: Candidates',
  )
  await expect(page.getByTestId('candidate-count')).toContainText('12')
  await expect(previous).toBeEnabled()

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('3 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 3 of 5: Filters',
  )
  await expect(page.getByTestId('filter-reasons')).toContainText(
    'Published before 2024',
  )
  await expect(page.getByTestId('filter-reasons')).toContainText(
    'Duration exceeds 15 minutes',
  )

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('4 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 4 of 5: Ranking',
  )
  await expect(page.getByTestId('ranking-order')).toContainText(
    'SVG Accessibility Starter Guide',
  )

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('5 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 5 of 5: Recommendations',
  )
  await expect(next).toBeDisabled()
  await expect(page.getByTestId('recommendation-notes')).toContainText(
    'Best balance of topic match',
  )
  await expect(
    page.getByRole('img', {
      name: /Search flow diagram, step 5 of 5: Recommendations/i,
    }),
  ).toBeVisible()

  await previous.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('4 of 5')
  await expect(next).toBeEnabled()

  await previous.click()
  await previous.click()
  await previous.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('1 of 5')
  await expect(previous).toBeDisabled()
})

test('home has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await assertNoHorizontalOverflow(page)
})

test('home has no horizontal overflow on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await page.goto('/')
  await assertNoHorizontalOverflow(page)
  await expect(page.locator('.flow-diagram--mobile')).toBeVisible()
  await expect(page.locator('.flow-diagram--desktop')).toBeHidden()
})
