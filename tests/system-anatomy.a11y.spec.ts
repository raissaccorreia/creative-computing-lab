import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('System Anatomy 2D baseline has no detectable accessibility violations @a11y', async ({
  page,
}) => {
  await page.goto('/?demo=system-anatomy')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('System Anatomy degraded snapshot has no detectable accessibility violations @a11y', async ({
  page,
}) => {
  await page.goto('/?demo=system-anatomy')
  await page.getByRole('radio', { name: /Degraded/ }).check()
  await page.getByRole('button', { name: /Index index/ }).click()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
