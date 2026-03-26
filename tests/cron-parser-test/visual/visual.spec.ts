import { test, expect } from '@playwright/test'

test.describe('Cron 解析工具 - 视觉回归', () => {
  test('初始状态截图', async ({ page }) => {
    await page.goto('/cron-parser')
    await expect(page).toHaveScreenshot('cron-parser-initial.png')
  })

  test('解析后状态截图', async ({ page }) => {
    await page.goto('/cron-parser')
    // 使用第一个 input 元素
    await page.locator('input[type="text"]').first().fill('*/5 * * * *')
    // 等待自动解析完成
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('cron-parser-parsed.png')
  })
})
