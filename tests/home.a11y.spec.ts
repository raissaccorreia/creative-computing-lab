import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home page has no detectable accessibility violations @a11y', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('img', {
      name: 'Search flow from query to recommendations',
    }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})

test('home page has no detectable accessibility violations on mobile @a11y', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(
    page.getByRole('img', {
      name: 'Search flow from query to recommendations',
    }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
