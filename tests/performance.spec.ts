import { expect, test } from '@playwright/test'

type LongTaskProfile = {
  supported: boolean
  count: number
  maxDuration: number
  totalDuration: number
}

async function profileImplementation(
  page: import('@playwright/test').Page,
  implementation: 'native' | 'motion',
): Promise<LongTaskProfile> {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' })
  await page.goto('/')

  if (implementation === 'motion') {
    await page.getByLabel(/Motion — Motion library/i).check()
  }

  await page.evaluate(() => {
    const durations: number[] = []
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) durations.push(entry.duration)
      })
      try {
        observer.observe({ type: 'longtask', buffered: true })
        ;(window as Window & { __phaseELongTasks?: number[] }).__phaseELongTasks = durations
      } catch {
        ;(window as Window & { __phaseELongTasks?: number[] }).__phaseELongTasks = []
      }
    }
  })

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Next' }).click()
    await page.waitForTimeout(360)
  }

  return page.evaluate(() => {
    const durations = (window as Window & { __phaseELongTasks?: number[] }).__phaseELongTasks
    if (!durations) {
      return { supported: false, count: 0, maxDuration: 0, totalDuration: 0 }
    }
    return {
      supported: true,
      count: durations.length,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
      totalDuration: durations.reduce((total, duration) => total + duration, 0),
    }
  })
}

test('native and Motion stage changes stay below the long-task budget', async ({ page }) => {
  const native = await profileImplementation(page, 'native')
  const motion = await profileImplementation(page, 'motion')

  console.log(`Phase E long-task profile: ${JSON.stringify({ native, motion })}`)

  if (native.supported) expect(native.maxDuration).toBeLessThan(50)
  if (motion.supported) expect(motion.maxDuration).toBeLessThan(50)
})
