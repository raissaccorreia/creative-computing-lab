import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home page has no detectable accessibility violations @a11y', async ({
  page,
}) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
