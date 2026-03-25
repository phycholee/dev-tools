// tests/url-codec-test/visual/visual.spec.ts
import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('URL Codec Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/url-codec-test/visual/baseline',
    'tests/report/visual'
  )

  test('initial empty state', async ({ page }) => {
    await page.goto('/url-codec')
    await page.waitForLoadState('networkidle')

    const screenshot = await page.screenshot()
    const result = await comparator.compare('url-codec-empty', screenshot)
    if (!result.match) {
      console.log(`Visual diff: ${(result.diffRatio * 100).toFixed(2)}%`)
    }
    expect(result.match).toBe(true)
  })

  test('encode mode with two Cards', async ({ page }) => {
    await page.goto('/url-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('hello 中文 a=1&b=2')
    await page.getByRole('button', { name: '编码' }).click()
    await page.waitForTimeout(300)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('url-codec-encode', screenshot)
    expect(result.match).toBe(true)
  })

  test('decode mode with one Card', async ({ page }) => {
    await page.goto('/url-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('%E4%B8%AD%E6%96%87')
    await page.getByRole('button', { name: '解码' }).click()
    await page.waitForTimeout(300)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('url-codec-decode', screenshot)
    expect(result.match).toBe(true)
  })

  test('decode error state', async ({ page }) => {
    await page.goto('/url-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('%GG')
    await page.getByRole('button', { name: '解码' }).click()
    await page.waitForTimeout(300)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('url-codec-error', screenshot)
    expect(result.match).toBe(true)
  })
})
