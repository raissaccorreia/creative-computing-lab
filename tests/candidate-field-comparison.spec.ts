import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

async function expectMeasurementToFinish(page: import('@playwright/test').Page) {
  const status = page.getByTestId('candidate-field-measurement').locator('[data-status]')
  await expect
    .poll(() => status.getAttribute('data-status'), { timeout: 10_000 })
    .toMatch(/completed|budget-exceeded/)
  await expect(status).toHaveAttribute('data-duration-ms', /\d+\.\d+/)
}

test('comparison harness preserves the contract when switching renderer and state', async ({
  page,
}) => {
  await page.goto('/?demo=candidate-field-comparison')

  await expect(
    page.getByRole('heading', { level: 2, name: 'Candidate Field Comparison' }),
  ).toBeVisible()
  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveAttribute(
    'data-renderer',
    'svg',
  )
  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveAttribute(
    'data-candidate-count',
    '250',
  )

  await page.getByLabel('Candidate title or id').fill('candidate-00001')
  await page.getByRole('button', { name: 'Inspect' }).click()
  await expect(page.getByTestId('candidate-field-details')).toContainText('candidate-00001')

  await page.getByRole('radio', { name: /Canvas 2D/ }).check()
  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveAttribute(
    'data-renderer',
    'canvas',
  )
  await expect(page.getByTestId('candidate-field-details')).toContainText('candidate-00001')

  await page.getByRole('radio', { name: /Filtered/ }).check()
  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveAttribute(
    'data-state',
    'filtered',
  )
  await expect(page.locator('.candidate-field__summary')).toContainText(
    'marked as filtered',
  )

  await page.getByRole('button', { name: 'Measure current workload' }).click()
  await expectMeasurementToFinish(page)
  await expect(page.getByTestId('candidate-field-measurement')).toContainText('250')
})

test('comparison harness exposes stress presets and guards unsafe SVG volume', async ({ page }) => {
  await page.goto(
    '/?demo=candidate-field-comparison&renderer=svg&volume=50000&state=reordered',
  )

  await expect(page.getByTestId('candidate-field-comparison-guard')).toBeVisible()
  await expect(page.getByTestId('candidate-field-comparison-guard')).toContainText(
    'guarded above 25,000 candidates',
  )
  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure current workload' }).click()
  await expect(
    page.getByTestId('candidate-field-measurement').locator('[data-status="guarded"]'),
  ).toBeVisible()
})

test('Canvas can mount a bounded stress preset and the layout remains contained', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=candidate-field-comparison&renderer=canvas&volume=10000')

  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveAttribute(
    'data-renderer',
    'canvas',
  )
  await expect(page.getByTestId('candidate-field-comparison-surface')).toHaveAttribute(
    'data-candidate-count',
    '10000',
  )
  await expect(page.getByLabel('Candidate volume')).toHaveValue('10000')
  await assertNoHorizontalOverflow(page)
})

test('comparison view has no detectable accessibility violations @a11y', async ({ page }) => {
  await page.goto('/?demo=candidate-field-comparison')
  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})

test('guarded comparison view has no detectable accessibility violations @a11y', async ({
  page,
}) => {
  await page.goto('/?demo=candidate-field-comparison&renderer=svg&volume=50000')
  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
