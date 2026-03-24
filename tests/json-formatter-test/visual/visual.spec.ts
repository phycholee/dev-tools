import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('JSON Formatter Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/json-formatter-test/visual/baseline',
    'tests/report/visual'
  )

  test('main interface layout', async ({ page }) => {
    await page.goto('/json-formatter')
    await page.waitForLoadState('networkidle')

    const screenshot = await page.screenshot()
    const result = await comparator.compare('json-formatter-main', screenshot)

    if (!result.match) {
      console.log(`Visual diff: ${(result.diffRatio * 100).toFixed(2)}%`)
    }

    expect(result.match).toBe(true)
  })

  test('formatted output state', async ({ page }) => {
    await page.goto('/json-formatter')
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type('{"a":1,"b":2}')
    
    await page.click('button:has-text("格式化")')
    await page.waitForTimeout(500)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('json-formatter-formatted', screenshot)

    expect(result.match).toBe(true)
  })

  test('error state', async ({ page }) => {
    await page.goto('/json-formatter')
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type('{invalid}')
    
    await page.click('button:has-text("格式化")')
    await page.waitForTimeout(500)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('json-formatter-error', screenshot)

    expect(result.match).toBe(true)
  })
})
