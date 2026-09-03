import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

test('candidate field exposes the SVG baseline and accessible inspection path', async ({
  page,
}) => {
  await page.goto('/?demo=candidate-field')

  await expect(
    page.getByRole('heading', { level: 2, name: 'Candidate Field' }),
  ).toBeVisible()
  await expect(page.getByTestId('candidate-field-svg-wrap')).toBeVisible()
  await expect(page.locator('.candidate-field__summary')).toContainText(
    '250 candidates; all candidates are shown',
  )

  const search = page.getByLabel('Candidate title or id')
  await search.fill('candidate-00001')
  await page.getByRole('button', { name: 'Inspect' }).click()

  await expect(page.getByTestId('candidate-field-details')).toContainText(
    'SVG Accessibility Starter Guide',
  )
  await expect(page.getByTestId('candidate-field-details')).toContainText(
    'candidate-00001',
  )

  await page.getByRole('radio', { name: /Filtered/ }).check()
  await expect(page.locator('.candidate-field__summary')).toContainText(
    'candidates are marked as filtered',
  )

  await page.getByRole('radio', { name: /Reordered/ }).check()
  await expect(page.locator('.candidate-field__summary')).toContainText(
    'deterministic score order',
  )
})

test('candidate field supports the product volume range without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=candidate-field')

  await page.getByLabel('Candidate volume').selectOption('5000')
  await expect(page.locator('.candidate-field__summary')).toContainText('5,000 candidates')
  await expect(page.locator('[data-candidate-id]')).toHaveCount(5000)
  await assertNoHorizontalOverflow(page)
})

test('candidate field has no detectable accessibility violations @a11y', async ({ page }) => {
  await page.goto('/?demo=candidate-field')
  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
