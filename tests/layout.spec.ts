import { expect, test } from '@playwright/test'

test.describe('responsive lab shell', () => {
  test('desktop sidebar exposes every experiment and fills the viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    const navigation = page.getByRole('navigation', { name: 'Experiments' })
    await expect(navigation).toBeVisible()
    await expect(navigation.getByRole('link')).toHaveCount(4)
    await expect(
      navigation.getByRole('link', { name: 'System Anatomy' }),
    ).toHaveAttribute('href', '/?demo=system-anatomy')
    await expect(
      navigation.getByRole('link', { name: 'Search Flow Explorer' }),
    ).toHaveAttribute('aria-current', 'page')

    const geometry = await page.evaluate(() => {
      const root = document.getElementById('root')!.getBoundingClientRect()
      return {
        rootLeft: root.left,
        rootWidth: root.width,
        viewportWidth: document.documentElement.clientWidth,
        accent: getComputedStyle(document.documentElement)
          .getPropertyValue('--page-accent')
          .trim(),
      }
    })

    expect(Math.abs(geometry.rootLeft)).toBeLessThanOrEqual(1)
    expect(Math.abs(geometry.rootWidth - geometry.viewportWidth)).toBeLessThanOrEqual(1)
    expect(geometry.accent).toBe('#27a1a4')
  })

  test('mobile sidebar opens as a curtain and closes after navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'Open experiments menu' })
    await expect(trigger).toBeVisible()
    await expect(
      page.locator('[data-sidebar="sidebar"][data-mobile="true"]'),
    ).toHaveCount(0)

    await trigger.click()

    const mobileSidebar = page.locator(
      '[data-sidebar="sidebar"][data-mobile="true"]',
    )
    await expect(mobileSidebar).toBeVisible()
    await expect(
      mobileSidebar.getByRole('navigation', { name: 'Experiments' }),
    ).toBeVisible()
    await expect(page.locator('[data-slot="sheet-overlay"]')).toBeVisible()
    await expect(
      mobileSidebar.getByRole('button', { name: 'Close experiments menu' }),
    ).toBeVisible()

    await mobileSidebar
      .getByRole('link', { name: 'Candidate Field', exact: true })
      .click()
    await expect(page).toHaveURL(/demo=candidate-field/)
    await expect(
      page.getByRole('heading', { level: 2, name: 'Candidate Field' }),
    ).toBeVisible()
    await expect(
      page.locator('[data-sidebar="sidebar"][data-mobile="true"]'),
    ).toHaveCount(0)
  })
})
