import { test, expect } from '@playwright/test'

test.describe('Cron 解析工具 - 视觉回归', () => {
  test('初始状态截图', async ({ page }) => {
    await page.goto('/cron-parser')
    await expect(page).toHaveScreenshot('cron-parser-initial.png')
  })

  test('解析后状态截图', async ({ page }) => {
    await page.goto('/cron-parser')
    await page.fill('input[placeholder="*/5 * * * *"]', '*/5 * * * *')
    await page.click('button:has-text("解析")')
    await expect(page).toHaveScreenshot('cron-parser-parsed.png')
  })
})
