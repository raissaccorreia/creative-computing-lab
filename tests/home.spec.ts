import { expect, test } from '@playwright/test'

const STAGES = [
  'Query',
  'Candidates',
  'Filters',
  'Ranking',
  'Recommendations',
] as const

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

function desktopResource(page: import('@playwright/test').Page, id: string) {
  return page.locator(
    `.flow-diagram--desktop [role="button"][data-resource-id="${id}"]`,
  )
}

function mobileResource(page: import('@playwright/test').Page, id: string) {
  return page.locator(
    `.flow-diagram--mobile [role="button"][data-resource-id="${id}"]`,
  )
}

async function countRunningAnimations(page: import('@playwright/test').Page) {
  return page.locator('.search-flow__visual-layout').evaluate((container) => {
    const elements = [container, ...Array.from(container.querySelectorAll('*'))]
    return elements.reduce(
      (count, element) =>
        count + element.getAnimations().filter((animation) => animation.playState === 'running').length,
      0,
    )
  })
}

test('home page smoke', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Creative Computing Lab/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('main')).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Creative Computing Lab' }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { level: 2, name: 'Search Flow Explorer' }),
  ).toBeVisible()

  const diagram = page.getByRole('group', {
    name: /Search flow diagram, step 1 of 5: Query/i,
  })
  await expect(diagram).toBeVisible()

  for (const stage of STAGES) {
    await expect(page.getByText(stage, { exact: true }).first()).toBeVisible()
  }

  await expect(
    page.getByRole('heading', { name: 'Textual equivalent' }),
  ).toBeVisible()
  await expect(
    page.getByText(/The query is interpreted as meaning plus constraints/i).first(),
  ).toBeVisible()

  await expect(page.getByText('Vite + React')).toHaveCount(0)
})

test('search flow stage navigation and snapshots', async ({ page }) => {
  await page.goto('/')

  const previous = page.getByRole('button', { name: 'Previous' })
  const next = page.getByRole('button', { name: 'Next' })

  await expect(previous).toBeDisabled()
  await expect(next).toBeEnabled()
  await expect(page.locator('.search-flow__step-count')).toHaveText('1 of 5')
  await expect(page.locator('.search-flow__live')).toContainText('Step 1 of 5: Query')

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('2 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 2 of 5: Candidates',
  )
  await expect(page.getByTestId('candidate-count')).toContainText('12')
  await expect(previous).toBeEnabled()

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('3 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 3 of 5: Filters',
  )
  await expect(page.getByTestId('filter-reasons')).toContainText(
    'Published before 2024',
  )
  await expect(page.getByTestId('filter-reasons')).toContainText(
    'Duration exceeds 15 minutes',
  )

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('4 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 4 of 5: Ranking',
  )
  await expect(page.getByTestId('ranking-order')).toContainText(
    'SVG Accessibility Starter Guide',
  )

  await next.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('5 of 5')
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 5 of 5: Recommendations',
  )
  await expect(next).toBeDisabled()
  await expect(page.getByTestId('recommendation-notes')).toContainText(
    'Best balance of topic match',
  )
  await expect(
    page.getByRole('group', {
      name: /Search flow diagram, step 5 of 5: Recommendations/i,
    }),
  ).toBeVisible()

  await previous.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('4 of 5')
  await expect(next).toBeEnabled()

  await previous.click()
  await previous.click()
  await previous.click()
  await expect(page.locator('.search-flow__step-count')).toHaveText('1 of 5')
  await expect(previous).toBeDisabled()
})

test('home has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await assertNoHorizontalOverflow(page)
})

test('home has no horizontal overflow on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await page.goto('/')
  await assertNoHorizontalOverflow(page)
  await expect(page.locator('.flow-diagram--mobile')).toBeVisible()
  await expect(page.locator('.flow-diagram--desktop')).toBeHidden()
})

test('search flow resource inspection works with keyboard and preserves selection rules', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByTestId('resource-details-empty')).toBeVisible()

  await page.getByRole('button', { name: 'Next' }).click()
  const candidateControls = page.locator(
    '.flow-diagram--desktop [role="button"][data-resource-id]',
  )
  await expect(candidateControls).toHaveCount(12)

  const firstCandidate = desktopResource(page, 'svg-a11y-starter')
  await firstCandidate.focus()
  await page.keyboard.press('Enter')
  await expect(firstCandidate).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('selected-resource-title')).toHaveText(
    'SVG Accessibility Starter Guide',
  )
  await expect(page.getByTestId('resource-explanation')).toContainText(
    'broad initial synthetic pool',
  )

  const pointerCandidate = desktopResource(page, 'keyboard-svg-paths')
  await pointerCandidate.click()
  await expect(pointerCandidate).toHaveAttribute('aria-pressed', 'true')

  const scrollBeforeSpace = await page.evaluate(() => window.scrollY)
  const secondCandidate = desktopResource(page, 'title-desc-patterns')
  await secondCandidate.focus()
  await page.keyboard.press(' ')
  await expect(secondCandidate).toHaveAttribute('aria-pressed', 'true')
  const scrollAfterSpace = await page.evaluate(() => window.scrollY)
  expect(scrollAfterSpace).toBe(scrollBeforeSpace)

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(desktopResource(page, 'title-desc-patterns')).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  const removedResource = desktopResource(page, 'old-svg-primer')
  await removedResource.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('resource-explanation')).toContainText(
    'Published before 2024',
  )

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByTestId('resource-details-empty')).toBeVisible()
  await expect(desktopResource(page, 'old-svg-primer')).toHaveCount(0)

  const rankedResource = desktopResource(page, 'svg-a11y-starter')
  await rankedResource.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('resource-score')).toContainText('Query match')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(desktopResource(page, 'svg-a11y-starter')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByTestId('resource-explanation')).toContainText(
    'one explained option',
  )
})

test('search flow resource inspection works in the vertical composition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(
    page.locator('.flow-diagram--mobile [role="button"][data-resource-id]'),
  ).toHaveCount(12)

  const resource = mobileResource(page, 'svg-a11y-starter')
  await resource.focus()
  await page.keyboard.press('Enter')
  await expect(resource).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('selected-resource-title')).toHaveText(
    'SVG Accessibility Starter Guide',
  )
})

test('mobile ranking resources stay inside the ranking panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Next' }).click()
  }

  const rankingStage = page.locator('.flow-diagram--mobile [data-stage="Ranking"]')
  const panel = rankingStage.locator('.flow-panel')
  const resources = rankingStage.locator('[role="button"][data-resource-id]')
  await expect(resources).toHaveCount(6)

  const panelBox = await panel.boundingBox()
  expect(panelBox).not.toBeNull()
  for (let index = 0; index < (await resources.count()); index += 1) {
    const resourceBox = await resources.nth(index).boundingBox()
    expect(resourceBox).not.toBeNull()
    expect(resourceBox!.y + resourceBox!.height).toBeLessThanOrEqual(
      panelBox!.y + panelBox!.height + 1,
    )
  }
})

test('native motion animates stage changes when reduced motion is not requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect
    .poll(() => countRunningAnimations(page), { timeout: 1000 })
    .toBeGreaterThan(0)
})

test('motion implementation animates the same stage transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  await expect(page.getByLabel(/Motion — Motion library/i)).toBeVisible()
  await page.getByLabel(/Motion — Motion library/i).check()
  await expect(page.getByLabel(/Motion — Motion library/i)).toBeChecked()

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 3 of 5: Filters',
  )
  await expect
    .poll(() => countRunningAnimations(page), { timeout: 1000 })
    .toBeGreaterThan(0)
})

test('motion implementation respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByLabel(/Motion — Motion library/i).check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 3 of 5: Filters',
  )
  await expect.poll(() => countRunningAnimations(page)).toBe(0)
})

test('switching motion implementations preserves stage and selection', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Next' }).click()
  const resource = desktopResource(page, 'svg-a11y-starter')
  await resource.click()

  await page.getByLabel(/Motion — Motion library/i).check()
  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 2 of 5: Candidates',
  )
  await expect(page.getByTestId('selected-resource-title')).toHaveText(
    'SVG Accessibility Starter Guide',
  )
})

test('theme control cycles through light, dark, and system', async ({ page }) => {
  await page.goto('/')
  const themeToggle = page.getByRole('button', { name: /Theme: system/i })

  await expect(themeToggle).toHaveAttribute('data-theme-choice', 'system')
  await themeToggle.click()
  await expect(page.getByRole('button', { name: /Theme: light/i })).toHaveAttribute(
    'data-theme-choice',
    'light',
  )
  await page.getByRole('button', { name: /Theme: light/i }).click()
  await expect(page.getByRole('button', { name: /Theme: dark/i })).toHaveAttribute(
    'data-theme-choice',
    'dark',
  )
  await page.getByRole('button', { name: /Theme: dark/i }).click()
  await expect(page.getByRole('button', { name: /Theme: system/i })).toHaveAttribute(
    'data-theme-choice',
    'system',
  )
})

test('native motion reaches the same state without animations when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 3 of 5: Filters',
  )
  await expect.poll(() => countRunningAnimations(page)).toBe(0)
})

test('native motion can be interrupted without changing the final stage', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const next = page.getByRole('button', { name: 'Next' })
  await next.click()
  await next.click()
  await next.click()

  await expect(page.locator('.search-flow__live')).toContainText(
    'Step 4 of 5: Ranking',
  )
})
