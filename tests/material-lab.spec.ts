import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('Material Lab composes PBR and shader specimens with shared, mapped controls', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/?demo=material-lab')

  await expect(page.getByRole('heading', { level: 1, name: 'Material Lab' })).toBeVisible()
  await expect(page.locator('.material-lab__scene-key').getByText('PBR material')).toBeVisible()
  await expect(page.locator('.material-lab__scene-key').getByText('Wave shader')).toBeVisible()

  const roughness = page.getByRole('slider', { name: 'Roughness' })
  const metalness = page.getByRole('slider', { name: 'Metalness' })
  const patternScale = page.getByRole('slider', { name: 'Pattern scale' })
  const preview = page.getByRole('img', { name: /Three studio specimens/ })

  await expect(roughness).toBeEnabled()
  await expect(metalness).toBeEnabled()
  await expect(patternScale).toBeEnabled()
  await expect(roughness).toHaveValue('0.34')
  await expect(metalness).toHaveValue('0.72')
  await expect(patternScale).toHaveValue('6')
  await expect(preview).toHaveAttribute('aria-label', /left torus knot and lower sphere use PBR material/)
  await expect(preview).toHaveAttribute('aria-label', /right torus knot uses a static wave shader/)

  await expect(page.locator('canvas')).toHaveAttribute('data-scene-ready', 'true')
  const firstRenderMs = await page.evaluate(() =>
    performance.getEntriesByName('material-lab:first-render')[0]?.startTime,
  )
  expect(firstRenderMs).toBeGreaterThan(0)
  const environment = await page.evaluate(() => ({
    browser: navigator.userAgent,
    platform: navigator.platform,
    viewport: `${innerWidth}x${innerHeight}`,
  }))
  console.log(`Material Lab first render: ${firstRenderMs?.toFixed(1)} ms; ${JSON.stringify(environment)}`)

  await roughness.focus()
  await roughness.press('End')
  await metalness.focus()
  await metalness.press('Home')
  await patternScale.focus()
  await patternScale.press('End')

  await expect(roughness).toHaveValue('1')
  await expect(metalness).toHaveValue('0')
  await expect(patternScale).toHaveValue('14')
  await expect(preview).toHaveAttribute('aria-label', /roughness 1\.00 and metalness 0\.00/)
  await expect(preview).toHaveAttribute('aria-label', /pattern scale 14/)
  await expect(page.locator('.material-lab__readout')).toContainText('Roughness 1.00')
  await expect(page.locator('.material-lab__readout')).toContainText('Metalness 0.00')
  await expect(page.locator('.material-lab__readout')).toContainText('Pattern scale 14')

  await page.locator('#material-color').fill('#416770')
  await expect(preview).toHaveAttribute('aria-label', /base color #416770/i)

  await page.getByRole('button', { name: 'Reset to reference' }).click()
  await expect(roughness).toHaveValue('0.34')
  await expect(metalness).toHaveValue('0.72')
  await expect(patternScale).toHaveValue('6')
  await expect(page.locator('#material-color')).toHaveValue('#86aaa5')

  expect(consoleErrors).toEqual([])
  expect(pageErrors).toEqual([])
})

test('Material Lab keeps a labeled three-sample explanation when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => null,
    })
  })
  await page.goto('/?demo=material-lab')

  await expect(page.locator('.material-lab__fallback-status'))
    .toContainText('WebGL is unavailable')
  const fallback = page.getByRole('group', { name: /CSS fallback samples/ })
  const samples = page.locator('.material-lab__fallback-specimen')
  await expect(fallback).toBeVisible()
  await expect(samples).toHaveCount(3)
  await expect(page.locator('.material-lab__fallback'))
    .toContainText('do not reproduce curved studio lighting')
  await expect(page.locator('.material-lab__fallback-item')).toContainText([
    '01 · PBR knot',
    '02 · Wave shader',
    '03 · PBR sphere',
  ])

  const referenceBands = await samples.nth(1).evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )
  await page.getByRole('slider', { name: 'Pattern scale' }).focus()
  await page.getByRole('slider', { name: 'Pattern scale' }).press('End')
  await expect(fallback).toHaveAttribute('aria-label', /pattern scale 14/)
  await expect(page.locator('.material-lab__fallback small')).toContainText('shader scale 14')
  const maximumBands = await samples.nth(1).evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )
  expect(maximumBands).not.toBe(referenceBands)

  await page.locator('#material-color').fill('#416770')
  await expect(samples.nth(0)).toHaveCSS('background-color', 'rgb(65, 103, 112)')
  await expect(samples.nth(1)).toHaveCSS('background-color', 'rgb(65, 103, 112)')
})

test('Material Lab controls have no detectable accessibility violations @a11y', async ({ page }) => {
  await page.goto('/?demo=material-lab')
  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})

test('Material Lab remains contained on narrow viewports', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/?demo=material-lab')

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))

    expect(metrics.scrollWidth, `at ${width}px`).toBeLessThanOrEqual(metrics.clientWidth + 1)
    await expect(page.getByRole('img', { name: /Three studio specimens/ })).toBeVisible()
    await expect(page.getByRole('slider', { name: 'Pattern scale' })).toBeVisible()
  }
})
