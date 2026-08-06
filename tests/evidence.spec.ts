import { expect, test } from '@playwright/test'

const OBSERVED_VIEWPORTS = [
  { width: 390, height: 844, label: 'mobile' },
  { width: 820, height: 1180, label: 'tablet' },
  { width: 1024, height: 900, label: 'desktop breakpoint' },
  { width: 1280, height: 900, label: 'desktop' },
] as const

test('canonical viewport widths do not introduce horizontal overflow', async ({ page }) => {
  for (const viewport of OBSERVED_VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))

    expect(
      metrics.scrollWidth,
      `${viewport.label} viewport overflowed by ${metrics.scrollWidth - metrics.clientWidth}px`,
    ).toBeLessThanOrEqual(metrics.clientWidth + 1)
  }
})

test('complete flow produces no console errors or page errors', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/')
  const next = page.getByRole('button', { name: 'Next' })
  for (let index = 0; index < 4; index += 1) {
    await next.click()
    await page.waitForTimeout(320)
  }

  expect(consoleErrors).toEqual([])
  expect(pageErrors).toEqual([])
})

test('the main content remains readable when scaled to 200%', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
  })

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    headingWidth: document.querySelector('h1')?.getBoundingClientRect().width ?? 0,
  }))

  expect(metrics.headingWidth).toBeGreaterThan(0)
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
})
