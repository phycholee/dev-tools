import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('Timestamp Converter Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/timestamp-converter-test/visual/baseline',
    'tests/report/visual'
  )

  test('main interface layout', async ({ page }) => {
    await page.goto('/timestamp-converter')
    await page.waitForLoadState('networkidle')

    const screenshot = await page.screenshot()
    const result = await comparator.compare('timestamp-converter-main', screenshot)

    if (!result.match) {
      console.log(`Visual diff: ${(result.diffRatio * 100).toFixed(2)}%`)
    }

    expect(result.match).toBe(true)
  })

  test('timestamp to date conversion state', async ({ page }) => {
    await page.goto('/timestamp-converter')
    
    const input = page.locator('input[placeholder*="时间戳"]')
    await input.fill('1710912345')
    await page.waitForTimeout(500)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('timestamp-converter-ts-to-date', screenshot)

    expect(result.match).toBe(true)
  })

  test('date to timestamp conversion state', async ({ page }) => {
    await page.goto('/timestamp-converter')
    
    const input = page.locator('input[placeholder*="yyyy-MM-dd"]')
    await input.fill('2024-03-20 12:00:00')
    await page.waitForTimeout(500)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('timestamp-converter-date-to-ts', screenshot)

    expect(result.match).toBe(true)
  })
})
