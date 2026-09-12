import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'

const baseUrl = process.env.SYSTEM_ANATOMY_URL ?? 'http://127.0.0.1:4173/?demo=system-anatomy'
const executablePath = process.env.CHROME_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const screenshotDir = process.env.SYSTEM_ANATOMY_SCREENSHOT_DIR ?? 'test-results/system-anatomy-evidence'
const viewports = [
  { width: 1280, height: 900, label: 'desktop' },
  { width: 390, height: 844, label: 'mobile' },
]
const modes = [
  { value: 'screen', label: '2D Screen' },
  { value: 'spatial', label: '3D Spatial' },
]

async function beginLongTaskCollection(page) {
  await page.evaluate(() => {
    const scope = globalThis
    scope.__systemAnatomyLongTasks = []
    if (typeof PerformanceObserver === 'undefined') return
    try {
      const observer = new PerformanceObserver((list) => {
        scope.__systemAnatomyLongTasks.push(...list.getEntries().map((entry) => entry.duration))
      })
      observer.observe({ entryTypes: ['longtask'] })
      scope.__systemAnatomyLongTaskObserver = observer
    } catch {
      // Long-task entries are optional browser evidence.
    }
  })
}

async function finishLongTaskCollection(page) {
  return page.evaluate(() => {
    globalThis.__systemAnatomyLongTaskObserver?.disconnect()
    return Array.isArray(globalThis.__systemAnatomyLongTasks)
      ? globalThis.__systemAnatomyLongTasks.map((duration) => Number(duration.toFixed(1)))
      : []
  })
}

const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'creative-computing-system-anatomy-'))
await fs.mkdir(screenshotDir, { recursive: true })
let context

try {
  context = await chromium.launchPersistentContext(profileDir, {
    executablePath,
    headless: process.env.SYSTEM_ANATOMY_HEADLESS === 'true',
    viewport: viewports[0],
    args: ['--disable-extensions', '--no-first-run', '--no-default-browser-check', '--use-angle=swiftshader'],
  })
} catch (error) {
  await fs.rm(profileDir, { recursive: true, force: true })
  throw new Error(`Could not launch Chrome at ${executablePath}. ${error instanceof Error ? error.message : String(error)}`)
}

try {
  const page = context.pages()[0] ?? (await context.newPage())
  page.setDefaultTimeout(30_000)
  const consoleErrors = []
  const pageErrors = []
  const externalRequests = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('request', (request) => {
    if (!request.url().startsWith(new URL(baseUrl).origin)) externalRequests.push(request.url())
  })

  const results = []
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    for (const mode of modes) {
      await page.goto(baseUrl, { waitUntil: 'load' })
      await expect(page.getByRole('heading', { level: 2, name: 'System Anatomy' })).toBeVisible()
      await beginLongTaskCollection(page)

      const startedAt = await page.evaluate(() => performance.now())
      await page.getByRole('radio', { name: mode.label }).check()
      await expect(page.getByTestId('system-anatomy-mode')).toHaveText(mode.label)
      if (mode.value === 'screen') {
        await expect(page.getByTestId('system-anatomy-screen')).toBeVisible()
      } else {
        await expect(page.getByTestId('system-anatomy-spatial')).toHaveAttribute('data-node-count', '8')
      }
      const switchResponseMs = Number((await page.evaluate((start) => performance.now() - start, startedAt)).toFixed(1))

      await page.locator('.system-anatomy__node-option').filter({ hasText: 'Gateway' }).click()
      await expect(page.getByTestId('system-anatomy-details')).toContainText('gateway')
      await page.getByRole('radio', { name: 'Degraded' }).check()
      await expect(page.getByTestId('system-anatomy-details')).toContainText('Attention')
      await page.screenshot({
        path: path.join(screenshotDir, `system-anatomy-${mode.value}-${viewport.label}.png`),
        fullPage: true,
      })

      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        devicePixelRatio: window.devicePixelRatio,
      }))
      results.push({
        mode: mode.value,
        viewport: viewport.label,
        width: viewport.width,
        height: viewport.height,
        nodeIds: await page.locator('.system-anatomy__node-option small').allTextContents(),
        selectedId: await page.getByTestId('system-anatomy-details').locator('dd').first().textContent(),
        degradedSelectedState: await page.getByTestId('system-anatomy-details').locator('dd').nth(2).textContent(),
        switchResponseMs,
        overflowPx: layout.scrollWidth - layout.clientWidth,
        devicePixelRatio: layout.devicePixelRatio,
        longTasksMs: await finishLongTaskCollection(page),
      })
    }
  }

  console.log(JSON.stringify({
    browser: await page.evaluate(() => navigator.userAgent),
    operatingSystem: `${os.platform()} ${os.release()}`,
    node: process.version,
    executablePath,
    profile: 'temporary, no login, extensions disabled',
    baseUrl,
    viewports,
    modes: modes.map((mode) => mode.value),
    results,
    consoleErrors,
    pageErrors,
    externalRequests: [...new Set(externalRequests)],
    screenshots: screenshotDir,
  }, null, 2))
} finally {
  await context.close()
  await fs.rm(profileDir, { recursive: true, force: true })
}
