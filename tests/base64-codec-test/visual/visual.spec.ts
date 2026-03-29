// tests/base64-codec-test/visual/visual.spec.ts
import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('Base64 Codec Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/base64-codec-test/visual/baseline',
    'tests/report/visual'
  )

  test('initial empty state', async ({ page }) => {
    await page.goto('/base64-codec')
    await page.waitForLoadState('networkidle')

    const screenshot = await page.screenshot()
    const result = await comparator.compare('base64-codec-empty', screenshot)
    if (!result.match) {
      console.log(`Visual diff: ${(result.diffRatio * 100).toFixed(2)}%`)
    }
    expect(result.match).toBe(true)
  })

  test('encode mode with format selector', async ({ page }) => {
    await page.goto('/base64-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('hello 中文')
    await page.getByRole('button', { name: '编码' }).click()
    await page.waitForTimeout(300)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('base64-codec-encode', screenshot)
    expect(result.match).toBe(true)
  })

  test('decode mode success', async ({ page }) => {
    await page.goto('/base64-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('aGVsbG8=')
    await page.getByRole('button', { name: '解码' }).click()
    await page.waitForTimeout(300)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('base64-codec-decode', screenshot)
    expect(result.match).toBe(true)
  })

  test('decode error state', async ({ page }) => {
    await page.goto('/base64-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('not valid!!!')
    await page.getByRole('button', { name: '解码' }).click()
    await page.waitForTimeout(300)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('base64-codec-error', screenshot)
    expect(result.match).toBe(true)
  })
})
