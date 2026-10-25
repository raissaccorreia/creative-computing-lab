import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('Material Lab switches between PBR and a parameterized wave shader', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/?demo=material-lab')

  await expect(page.getByRole('heading', { level: 1, name: 'Material Lab' })).toBeVisible()
  const pbrButton = page.getByRole('button', { name: 'PBR material' })
  const shaderButton = page.getByRole('button', { name: 'Wave shader' })
  const roughness = page.getByRole('slider', { name: 'Roughness' })
  const patternScale = page.getByRole('slider', { name: 'Pattern scale' })
  const preview = page.getByRole('img', { name: /Sculptural material specimen/ })

  await expect(pbrButton).toHaveAttribute('aria-pressed', 'true')
  await expect(roughness).toBeEnabled()
  await expect(patternScale).toBeDisabled()

  await roughness.focus()
  await roughness.press('End')
  await expect(roughness).toHaveValue('1')

  await shaderButton.focus()
  await shaderButton.press('Enter')
  await expect(shaderButton).toHaveAttribute('aria-pressed', 'true')
  await expect(roughness).toBeDisabled()
  await expect(patternScale).toBeEnabled()
  await expect(preview).toHaveAttribute('aria-label', /static procedural wave shader.*Pattern scale 6/)

  await patternScale.focus()
  await patternScale.press('End')
  await expect(patternScale).toHaveValue('14')
  await expect(preview).toHaveAttribute('aria-label', /Pattern scale 14/)
  await expect(page.locator('.material-lab__readout')).toContainText('Pattern scale 14')

  await pbrButton.focus()
  await pbrButton.press('Enter')
  await expect(roughness).toBeEnabled()
  await expect(roughness).toHaveValue('1')
  await expect(patternScale).toBeDisabled()
  await expect(patternScale).toHaveValue('14')

  await page.getByRole('button', { name: 'Reset to reference' }).click()
  await expect(roughness).toHaveValue('0.34')
  await expect(page.getByRole('slider', { name: 'Metalness' })).toHaveValue('0.72')
  await expect(patternScale).toHaveValue('6')

  expect(consoleErrors).toEqual([])
  expect(pageErrors).toEqual([])
})

test('Material Lab keeps an explained shader preview when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => null,
    })
  })
  await page.goto('/?demo=material-lab')

  await expect(page.locator('.material-lab__fallback-status'))
    .toContainText('WebGL is unavailable')
  await page.getByRole('button', { name: 'Wave shader' }).click()

  const fallback = page.getByRole('img', { name: /static procedural wave shader.*Pattern scale 6/ })
  const fallbackSpecimen = page.locator('.material-lab__fallback-specimen')
  await expect(fallback).toBeVisible()
  await expect(fallbackSpecimen).toHaveCSS('background-image', /repeating-linear-gradient/)
  await expect(page.locator('.material-lab__fallback small'))
    .toContainText('approximates the 6 soft bands')
  const referenceBands = await fallbackSpecimen.evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )

  await page.getByRole('slider', { name: 'Pattern scale' }).focus()
  await page.getByRole('slider', { name: 'Pattern scale' }).press('End')
  await expect(page.getByRole('img', { name: /Pattern scale 14/ })).toBeVisible()
  const maximumBands = await fallbackSpecimen.evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )
  expect(maximumBands).not.toBe(referenceBands)
})

test('Material Lab controls have no detectable accessibility violations @a11y', async ({ page }) => {
  await page.goto('/?demo=material-lab')
  await page.getByRole('button', { name: 'Wave shader' }).click()
  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})

test('Material Lab remains contained on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?demo=material-lab')

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  await expect(page.getByRole('button', { name: 'Wave shader' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Pattern scale' })).toBeVisible()
})
