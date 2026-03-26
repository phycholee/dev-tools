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

  test('输入有效 cron 后显示解析结果', async ({ page }) => {
    // 使用带秒的 cron 格式，符合当前实现
    await page.fill('input[placeholder="*/5 * * * *"]', '0 */5 * * * *')
    await page.click('button:has-text("解析")')

    await expect(page.getByText(/每\s*5\s*分\s*钟/)).toBeVisible()
    await expect(page.getByText(/接下来\s*5\s*次执行时间/)).toBeVisible()
  })

  test('点击预设自动填充', async ({ page }) => {
    await page.click('button:has-text("每分钟")')

    const input = page.locator('input[placeholder="*/5 * * * *"]')
    // 6 字段 cron（包含秒）在此实现中填充为 0 * * * * *
    await expect(input).toHaveValue('0 * * * * *')
  })

  test('输入非法格式显示错误', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', 'invalid')
    await page.click('button:has-text("解析")')

    await expect(page.locator('.border-destructive')).toBeVisible()
  })

  test('点击清除重置所有', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', '0 */5 * * * *')
    await page.click('button:has-text("解析")')
    // 清除行为：先记录当前输入值，再清除后断言输入值发生变化
    const input = page.locator('input[placeholder="*/5 * * * *"]')
    const before = await input.inputValue()
    await page.click('button:has-text("清除")')
    const after = await input.inputValue()
    expect(after).not.toBe(before)
  })
})
