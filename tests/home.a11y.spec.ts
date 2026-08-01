import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home page has no detectable accessibility violations @a11y', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('group', {
      name: /Search flow diagram, step 1 of 5: Query/i,
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
    page.getByRole('group', {
      name: /Search flow diagram, step 1 of 5: Query/i,
    }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})

test('search flow has no detectable accessibility violations after navigation @a11y', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 3 of 5: Filters',
  )

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
