import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'

const baseUrl = process.env.CANDIDATE_FIELD_URL ?? 'http://127.0.0.1:4173/?demo=candidate-field'
const executablePath =
  process.env.CHROME_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const volumes = [50, 250, 1000, 5000]

async function measureVolume(page, volume) {
  const startedAt = performance.now()
  await page.getByLabel('Candidate volume').selectOption(String(volume))
  await page.locator('[data-candidate-id]').nth(volume - 1).waitFor()
  const renderMs = performance.now() - startedAt

  const stateTimes = {}
  for (const state of ['filtered', 'reordered']) {
    const stateStartedAt = performance.now()
    await page.getByRole('radio', { name: new RegExp(state, 'i') }).check()
    await page.locator('.candidate-field__summary').waitFor()
    stateTimes[state] = Number((performance.now() - stateStartedAt).toFixed(1))
  }

  await page.getByRole('radio', { name: /Initial/ }).check()

  return {
    volume,
    markCount: await page.locator('[data-candidate-id]').count(),
    renderMs: Number(renderMs.toFixed(1)),
    stateMs: stateTimes,
  }
}

const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'creative-computing-chrome-'))
const context = await chromium.launchPersistentContext(profileDir, {
  executablePath,
  headless: false,
  viewport: { width: 1440, height: 1000 },
  args: ['--disable-extensions', '--no-first-run', '--no-default-browser-check'],
})

try {
  const page = context.pages()[0] ?? (await context.newPage())
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  const results = []

  for (const volume of volumes) {
    results.push(await measureVolume(page, volume))
  }

  console.log(
    JSON.stringify(
      {
        browser: await page.evaluate(() => navigator.userAgent),
        executablePath,
        profile: 'temporary, no login, extensions disabled',
        baseUrl,
        results,
      },
      null,
      2,
    ),
  )
} finally {
  await context.close()
  await fs.rm(profileDir, { recursive: true, force: true })
}
