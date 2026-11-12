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
    await expect(navigation.getByRole('link')).toHaveCount(6)
    await expect(
      navigation.getByRole('link', { name: 'System Anatomy' }),
    ).toHaveAttribute('href', '/?demo=system-anatomy')
    await expect(
      navigation.getByRole('link', { name: 'Search Flow Explorer' }),
    ).toHaveAttribute('aria-current', 'page')
    await expect(
      navigation.getByRole('link', { name: 'GPU Ranking Field' }),
    ).toHaveAttribute('href', '/?demo=gpu-ranking-field')

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

  test('desktop sidebar collapses to an icon rail and remembers it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    const sidebar = page.locator('[data-slot="sidebar"][data-state]')
    const collapse = page.getByRole('button', { name: 'Collapse experiments menu' })
    await expect(collapse).toBeVisible()
    await expect(collapse).toHaveAttribute('aria-expanded', 'true')

    await collapse.click()
    await expect(sidebar).toHaveAttribute('data-collapsible', 'icon')
    const expand = page.getByRole('button', { name: 'Expand experiments menu' })
    await expect(expand).toHaveAttribute('aria-expanded', 'false')

    const navigation = page.getByRole('navigation', { name: 'Experiments' })
    await expect(navigation.getByRole('link')).toHaveCount(6)
    await expect(
      navigation.getByRole('link', { name: 'Material Lab' }),
    ).toBeVisible()
    await expect
      .poll(() =>
        sidebar
          .locator('[data-slot="sidebar-container"]')
          .evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeLessThanOrEqual(64)

    await page.reload()
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed')

    await page.keyboard.press('Control+b')
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')
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
