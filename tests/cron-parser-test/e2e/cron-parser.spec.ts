import { test, expect } from '@playwright/test'

test.describe('Cron 解析工具', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cron-parser')
  })

  test('页面可访问，标题正确', async ({ page }) => {
    await expect(page.getByText('Cron表达式解析与可视化')).toBeVisible()
  })

  test('输入有效 cron 后显示解析结果', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', '*/5 * * * *')
    await page.click('button:has-text("解析")')

    await expect(page.getByText('每 5 分钟')).toBeVisible()
    await expect(page.getByText('接下来 5 次执行时间')).toBeVisible()
  })

  test('点击预设自动填充', async ({ page }) => {
    await page.click('button:has-text("每分钟")')

    const input = page.locator('input[placeholder="*/5 * * * *"]')
    await expect(input).toHaveValue('* * * * *')
  })

  test('输入非法格式显示错误', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', 'invalid')
    await page.click('button:has-text("解析")')

    await expect(page.locator('.border-destructive')).toBeVisible()
  })

  test('点击清除重置所有', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', '*/5 * * * *')
    await page.click('button:has-text("解析")')
    await page.click('button:has-text("清除")')

    const input = page.locator('input[placeholder="*/5 * * * *"]')
    await expect(input).toHaveValue('')
  })
})
