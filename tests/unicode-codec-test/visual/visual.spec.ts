// tests/unicode-codec-test/visual/visual.spec.ts
import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('Unicode Codec Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/unicode-codec-test/visual/baseline',
    'tests/report/visual'
  )

  test('initial empty state', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-empty', screenshot)
    expect(result.match).toBe(true)
  })

  test('encode result state', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.waitForTimeout(300)
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-encode', screenshot)
    expect(result.match).toBe(true)
  })

  test('decode result state', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('abc\\u4F60\\u597D')
    await page.getByRole('button', { name: '解码' }).click()
    await page.waitForTimeout(300)
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-decode', screenshot)
    expect(result.match).toBe(true)
  })

  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('A😀中')
    await page.getByRole('button', { name: '编码' }).click()
    await page.waitForTimeout(300)
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-mobile', screenshot)
    expect(result.match).toBe(true)
  })
})