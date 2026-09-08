import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'

const baseUrl =
  process.env.CANDIDATE_FIELD_URL ??
  'http://127.0.0.1:4173/?demo=candidate-field-comparison'
const executablePath =
  process.env.CHROME_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const headless = process.env.CANDIDATE_FIELD_HEADLESS === 'true'
const viewport = { width: 1440, height: 1000 }
const renderers = ['svg', 'canvas']
const productVolumes = [50, 250, 1000, 5000]
const stressVolumes = [10000, 25000, 50000, 100000]
const volumes = [...productVolumes, ...stressVolumes]
const states = ['initial', 'filtered', 'reordered']
const rendererLimits = { svg: 25000, canvas: 100000 }
const measurementBudgetMs = 2500
const requestedRuns = Number.parseInt(process.env.CANDIDATE_FIELD_RUNS ?? '1', 10)
const repeats = Number.isInteger(requestedRuns)
  ? Math.min(Math.max(requestedRuns, 1), 5)
  : 1

function guardedResult(renderer, volume) {
  const limit = rendererLimits[renderer]
  if (volume <= limit) return null

  return {
    renderer,
    volume,
    guardLimit: limit,
    status: 'guarded',
    reason: `${renderer === 'svg' ? 'SVG' : 'Canvas 2D'} is guarded above ${limit.toLocaleString('en-US')} candidates.`,
  }
}

function workloadUrl(renderer, volume, state) {
  const url = new URL(baseUrl)
  url.searchParams.set('demo', 'candidate-field-comparison')
  url.searchParams.set('renderer', renderer)
  url.searchParams.set('volume', String(volume))
  url.searchParams.set('state', state)
  return url.toString()
}

async function waitForWorkload(page, volume, state) {
  const surface = page.getByTestId('candidate-field-comparison-surface')
  await expect(surface).toBeVisible({ timeout: 60_000 })
  await expect(surface).toHaveAttribute('data-volume', String(volume), { timeout: 60_000 })
  await expect(surface).toHaveAttribute('data-state', state, { timeout: 60_000 })
  await expect(surface).toHaveAttribute('data-candidate-count', String(volume), {
    timeout: 60_000,
  })

  if (page.url().includes('renderer=svg')) {
    await expect.poll(() => page.locator('[data-candidate-id]').count(), { timeout: 60_000 }).toBe(volume)
  }
}

async function beginLongTaskCollection(page) {
  await page.evaluate(() => {
    const scope = globalThis
    scope.__candidateLongTaskObserver?.disconnect()
    scope.__candidateLongTasks = []

    if (typeof PerformanceObserver === 'undefined') return
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries().map((entry) => entry.duration)
        scope.__candidateLongTasks.push(...entries)
      })
      observer.observe({ entryTypes: ['longtask'] })
      scope.__candidateLongTaskObserver = observer
    } catch {
      // Long-task entries are optional browser evidence.
    }
  })
}

async function finishLongTaskCollection(page) {
  return page.evaluate(() => {
    globalThis.__candidateLongTaskObserver?.disconnect()
    return Array.isArray(globalThis.__candidateLongTasks)
      ? globalThis.__candidateLongTasks.map((duration) => Number(duration.toFixed(1)))
      : []
  })
}

async function measureCurrentWorkload(page, renderer, volume, state) {
  await beginLongTaskCollection(page)
  const startedAt = performance.now()
  await page.getByRole('button', { name: 'Measure current workload' }).click()

  const status = page.getByTestId('candidate-field-measurement').locator('[data-status]')
  await expect
    .poll(() => status.getAttribute('data-status'), { timeout: 60_000 })
    .toMatch(/completed|budget-exceeded/)

  const wallClockMs = Number((performance.now() - startedAt).toFixed(1))
  const measurement = await status.evaluate((element) => ({
    status: element.getAttribute('data-status'),
    durationMs: Number(element.getAttribute('data-duration-ms')),
    message: element.textContent?.trim() ?? '',
  }))
  const longTasksMs = await finishLongTaskCollection(page)

  return {
    renderer,
    volume,
    state,
    status: measurement.status,
    renderResponseMs: measurement.durationMs,
    wallClockMs,
    longTasksMs,
    renderedCount: Number(
      (
        (await page
          .getByTestId('candidate-field-measurement')
          .locator('div')
          .nth(1)
          .locator('strong')
          .textContent()) ?? ''
      ).replaceAll(',', ''),
    ),
    message: measurement.message,
  }
}

async function measureInspection(page, renderer, volume, state) {
  const startedAt = performance.now()
  await page.getByLabel('Candidate title or id').fill('candidate-00001')
  await page.getByRole('button', { name: 'Inspect' }).click()
  await expect(page.getByTestId('candidate-field-details')).toContainText('candidate-00001')

  return {
    renderer,
    volume,
    state,
    wallClockMs: Number((performance.now() - startedAt).toFixed(1)),
    selectedId: await page.getByTestId('candidate-field-details').locator('dd').first().textContent(),
  }
}

async function measureAllowedWorkload(page, renderer, volume) {
  await page.goto(workloadUrl(renderer, volume, 'initial'), { waitUntil: 'networkidle' })
  await waitForWorkload(page, volume, 'initial')

  const measurements = {}
  const inspections = {}

  for (const state of states) {
    if (state !== 'initial') {
      await page.getByRole('radio', { name: new RegExp(state, 'i') }).check()
      await waitForWorkload(page, volume, state)
    }

    measurements[state] = await measureCurrentWorkload(page, renderer, volume, state)
    inspections[state] = await measureInspection(page, renderer, volume, state)
  }

  return {
    renderer,
    volume,
    guardLimit: rendererLimits[renderer],
    status: 'measured',
    measurements,
    inspections,
  }
}

async function measureProfile(page) {
  const results = []

  for (const renderer of renderers) {
    for (const volume of volumes) {
      const guarded = guardedResult(renderer, volume)
      results.push(guarded ?? (await measureAllowedWorkload(page, renderer, volume)))
    }
  }

  return results
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  if (sorted.length === 0) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1))
    : Number(sorted[middle].toFixed(1))
}

function maximum(values) {
  return values.length === 0 ? null : Number(Math.max(...values).toFixed(1))
}

function summarizeProfiles(profiles) {
  const grouped = new Map()

  for (const profile of profiles) {
    for (const result of profile.results) {
      if (result.status !== 'measured') continue

      for (const state of states) {
        const key = `${result.renderer}:${result.volume}:${state}`
        const group = grouped.get(key) ?? {
          renderer: result.renderer,
          volume: result.volume,
          state,
          renderResponseMs: [],
          inspectionWallClockMs: [],
          longTasksMs: [],
        }
        group.renderResponseMs.push(result.measurements[state].renderResponseMs)
        group.inspectionWallClockMs.push(result.inspections[state].wallClockMs)
        group.longTasksMs.push(...result.measurements[state].longTasksMs)
        grouped.set(key, group)
      }
    }
  }

  return [...grouped.values()]
    .sort((a, b) => a.volume - b.volume || a.renderer.localeCompare(b.renderer) || a.state.localeCompare(b.state))
    .map((group) => ({
      renderer: group.renderer,
      volume: group.volume,
      state: group.state,
      samples: group.renderResponseMs.length,
      renderResponseMs: {
        median: median(group.renderResponseMs),
        maximum: maximum(group.renderResponseMs),
      },
      inspectionWallClockMs: {
        median: median(group.inspectionWallClockMs),
        maximum: maximum(group.inspectionWallClockMs),
      },
      longTaskMs: {
        maximum: maximum(group.longTasksMs),
        entries: group.longTasksMs.length,
      },
    }))
}

const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'creative-computing-chrome-'))
let context

try {
  context = await chromium.launchPersistentContext(profileDir, {
    executablePath,
    headless,
    viewport,
    args: ['--disable-extensions', '--no-first-run', '--no-default-browser-check'],
  })
} catch (error) {
  await fs.rm(profileDir, { recursive: true, force: true })
  throw new Error(
    `Could not launch Chrome at ${executablePath}. Set CHROME_EXECUTABLE if needed. ${error instanceof Error ? error.message : String(error)}`,
  )
}

try {
  const page = context.pages()[0] ?? (await context.newPage())
  page.setDefaultTimeout(60_000)
  const profiles = []

  for (let run = 1; run <= repeats; run += 1) {
    profiles.push({ run, results: await measureProfile(page) })
  }

  console.log(
    JSON.stringify(
      {
        browser: await page.evaluate(() => navigator.userAgent),
        operatingSystem: `${os.platform()} ${os.release()}`,
        node: process.version,
        executablePath,
        headless,
        profile: 'temporary, no login, extensions disabled',
        viewport,
        devicePixelRatio: await page.evaluate(() => window.devicePixelRatio),
        baseUrl,
        productVolumes,
        stressVolumes,
        states,
        rendererLimits,
        measurementBudgetMs,
        requestedRuns: Number.isInteger(requestedRuns) ? requestedRuns : 1,
        repeats,
        profiles,
        summary: summarizeProfiles(profiles),
      },
      null,
      2,
    ),
  )
} finally {
  await context.close()
  await fs.rm(profileDir, { recursive: true, force: true })
}
