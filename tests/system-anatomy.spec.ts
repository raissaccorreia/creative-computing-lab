import { expect, test } from '@playwright/test'

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

test('System Anatomy exposes a deterministic 2D baseline and semantic inspection path', async ({
  page,
}) => {
  await page.goto('/?demo=system-anatomy')

  await expect(page.getByRole('heading', { level: 2, name: 'System Anatomy' })).toBeVisible()
  await expect(page.getByTestId('system-anatomy-2d-surface')).toBeVisible()
  await expect(page.getByText('2D Screen', { exact: true })).toBeVisible()
  await expect(page.getByTestId('system-anatomy-summary')).toContainText(
    'All five nodes are available',
  )
  await expect(page.getByTestId('system-anatomy-details-empty')).toBeVisible()

  const nodeButtons = page.getByRole('button', { name: /Intake|Parser|Index|Coordinator|Output/ })
  await expect(nodeButtons).toHaveCount(5)

  await page.getByLabel('Node title or stable id').fill('index')
  await page.getByRole('button', { name: 'Inspect' }).click()
  await expect(page.getByTestId('system-anatomy-details')).toContainText('Index')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('index')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('Stores relationships')
})

test('System Anatomy preserves stable selection while the deterministic state changes', async ({
  page,
}) => {
  await page.goto('/?demo=system-anatomy')

  await page.getByRole('button', { name: /Index index/ }).click()
  await expect(page.getByTestId('system-anatomy-details')).toContainText('nominal')

  await page.getByRole('radio', { name: /Degraded/ }).check()
  await expect(page.getByTestId('system-anatomy-summary')).toContainText('Index needs attention')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('needs attention')
  await expect(page.getByRole('button', { name: /Index index/ })).toHaveAttribute('aria-pressed', 'true')
})

test('System Anatomy supports keyboard inspection and stays contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=system-anatomy')

  const parser = page.getByRole('button', { name: /Parser parser/ })
  await parser.focus()
  await page.keyboard.press('Enter')
  await expect(parser).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('system-anatomy-details')).toContainText('Parser')
  await assertNoHorizontalOverflow(page)
})
