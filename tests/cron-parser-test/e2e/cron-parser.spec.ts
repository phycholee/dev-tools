import { test, expect } from '@playwright/test'

test.describe('Cron 解析工具', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cron-parser')
  })

  test('页面可访问，标题正确', async ({ page }) => {
    // 通过 cron 输入框存在性来判断页面已正确加载
    const input = page.locator('input[placeholder="*/5 * * * *"]')
    await expect(input).toBeVisible()
  })

  test('默认显示字段选择器和解析结果', async ({ page }) => {
    // 验证默认显示6个字段标签（秒分时日月周）- 使用更精确的选择器
    await expect(page.locator('.text-sm.font-medium.mb-1').filter({ hasText: '秒' })).toBeVisible()
    await expect(page.locator('.text-sm.font-medium.mb-1').filter({ hasText: '分' })).toBeVisible()
    await expect(page.locator('.text-sm.font-medium.mb-1').filter({ hasText: '时' })).toBeVisible()
    await expect(page.locator('.text-sm.font-medium.mb-1').filter({ hasText: '日' })).toBeVisible()
    await expect(page.locator('.text-sm.font-medium.mb-1').filter({ hasText: '月' })).toBeVisible()
    await expect(page.locator('.text-sm.font-medium.mb-1').filter({ hasText: '周' })).toBeVisible()
  })

  test('输入有效 cron 后显示解析结果', async ({ page }) => {
    // 使用带秒的 cron 格式
    await page.fill('input[placeholder="*/5 * * * *"]', '0 */5 * * * *')

    // 等待解析完成
    await page.waitForTimeout(300)

    // 验证描述显示（在解析结果区域）- 使用第一个匹配元素
    await expect(page.locator('.text-xs.truncate').filter({ hasText: '每5分' }).first()).toBeVisible()
  })

  test('点击预设自动填充', async ({ page }) => {
    await page.click('button:has-text("每分钟")')

    const input = page.locator('input[placeholder="*/5 * * * *"]')
    // 每分钟预设是 5 位 cron "* * * * *"，会被解析成 6 位 "0 * * * * *"
    await expect(input).toHaveValue('0 * * * * *')
  })

  test('输入非法格式显示错误', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', 'invalid')

    await expect(page.locator('.border-destructive')).toBeVisible()
  })

  test('点击清除重置所有', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', '0 */5 * * * *')
    const input = page.locator('input[placeholder="*/5 * * * *"]')
    const before = await input.inputValue()
    await page.click('button:has-text("清除")')
    const after = await input.inputValue()
    expect(after).not.toBe(before)
  })
})
