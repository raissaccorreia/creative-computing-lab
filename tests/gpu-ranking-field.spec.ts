import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('weight controls reorder the deterministic top 50 candidates', async ({ page }) => {
  await page.goto('/?demo=gpu-ranking-field')

  await expect(page.getByRole('heading', { level: 2, name: 'GPU Ranking Field' })).toBeVisible()
  await expect(page.getByTestId('gpu-ranking-field-canvas')).toHaveAttribute('data-volume', '10000')

  const candidates = page.getByTestId('gpu-ranking-top-list')
  await expect(candidates.locator('option')).toHaveCount(50)
  const firstCandidate = await candidates.locator('option').first().textContent()

  const signalOne = page.getByRole('slider', { name: 'Signal 01' })
  await signalOne.focus()
  await signalOne.press('End')

  await expect.poll(() => candidates.locator('option').first().textContent()).not.toBe(firstCandidate)
  await expect(page.locator('dl[aria-label="Selected candidate details"]')).toBeVisible()
})

test('100,000-record CPU profile completes and reports its measured phases', async ({ page }) => {
  await page.goto('/?demo=gpu-ranking-field')

  const volume = page.getByLabel('Candidate volume')
  await volume.selectOption('100000')
  await expect(page.getByTestId('gpu-ranking-field-canvas')).toHaveAttribute('data-volume', '100000')

  const measure = page.getByRole('button', { name: 'Measure 20 updates' })
  await expect(measure).toBeEnabled()
  await measure.click()

  const profile = page.getByTestId('gpu-ranking-profile')
  await expect(profile).toContainText(/\d+ completed updates(?: before the 2500 ms run guard)?/, {
    timeout: 10_000,
  })
  await expect(profile).toContainText('100,000-record profile')
  await expect(profile).toContainText('Score / sort / paint')
})

test('ranking page remains accessible and contained on mobile @a11y', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=gpu-ranking-field')

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  await expect(page.getByRole('slider', { name: 'Signal 01' })).toBeVisible()
  await expect(page.getByTestId('gpu-ranking-field-canvas')).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
