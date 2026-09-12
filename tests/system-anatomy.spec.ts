import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('System Anatomy defaults to the 2D Screen baseline', async ({ page }) => {
  await page.goto('/?demo=system-anatomy')

  await expect(page.getByRole('heading', { level: 2, name: 'System Anatomy' })).toBeVisible()
  await expect(page.getByTestId('system-anatomy-screen')).toBeVisible()
  await expect(page.getByText('2D Screen', { exact: true })).toBeVisible()
  await expect(page.getByTestId('system-anatomy-summary')).toContainText(
    'Steady state: All paths are available',
  )
})
test('System Anatomy preserves deterministic identity, selection, and state explanations', async ({
  page,
}) => {
  await page.goto('/?demo=system-anatomy')

  const node = page.getByRole('button', { name: /Select Gateway/i }).first()
  await node.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('gateway')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('Healthy')

  await page.getByRole('radio', { name: 'Degraded' }).check()
  await expect(page.getByTestId('system-anatomy-summary')).toContainText(
    'Degraded state: The secondary worker is blocked',
  )
  await expect(page.getByTestId('system-anatomy-details')).toContainText('Attention')

  await page.getByRole('button', { name: /Select Worker B/i }).last().click()
  await expect(page.getByTestId('system-anatomy-details')).toContainText('worker-b')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('Blocked')
  await expect(page.getByTestId('system-anatomy-details')).toContainText(
    'unavailable, so its path cannot complete normally',
  )
})

test('System Anatomy has no detectable accessibility violations @a11y', async ({ page }) => {
  await page.goto('/?demo=system-anatomy')
  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})

test('System Anatomy remains contained on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=system-anatomy')

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  await expect(page.getByRole('button', { name: /Select Request input/i }).last()).toBeVisible()
})
