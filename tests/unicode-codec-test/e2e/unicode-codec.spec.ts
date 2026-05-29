// tests/unicode-codec-test/e2e/unicode-codec.spec.ts
import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('Unicode Codec E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Unicode编码转换')
    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should disable encode and decode buttons when input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: '编码' })).toBeDisabled()
    await expect(page.getByRole('button', { name: '解码' })).toBeDisabled()
  })

  test('should show strategy buttons and empty state by default', async ({ page }) => {
    await expect(page.getByText('编码策略：')).toBeVisible()
    await expect(page.getByRole('button', { name: '仅非 ASCII' })).toBeVisible()
    await expect(page.getByRole('button', { name: '全部字符' })).toBeVisible()
    await expect(page.getByText('输入文本后，点击"编码"或"解码"查看结果')).toBeVisible()
  })

  test('should encode with non-ASCII mode by default', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.getByText('编码结果')).toBeVisible()
    await expect(page.locator('pre')).toContainText('abc\\u4F60\\u597D')
  })

  test('should update encode result when switching to all characters mode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.getByRole('button', { name: '全部字符' }).click()
    await expect(page.locator('pre')).toContainText('\\u0061\\u0062\\u0063\\u4F60\\u597D')
  })

  test('should decode mixed text and Unicode escapes', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc\\u4F60\\u597D')
    await page.getByRole('button', { name: '解码' }).click()
    await expect(page.getByText('解码结果')).toBeVisible()
    await expect(page.locator('pre')).toContainText('abc你好')
  })

  test('should preserve invalid Unicode escapes without error UI', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc\\uZZZZ')
    await page.getByRole('button', { name: '解码' }).click()
    await expect(page.locator('pre')).toContainText('abc\\uZZZZ')
    await expect(page.locator('.text-destructive')).not.toBeVisible()
  })

  test('should copy result and show toast', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions only supported in Chromium')
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.getByRole('button', { name: '复制' }).click()
    await expect(page.locator('text=已复制到剪贴板')).toBeVisible({ timeout: 3000 })
  })

  test('should clear input, result, and reset encode mode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.getByRole('button', { name: '全部字符' }).click()
    await page.getByRole('button', { name: '清除' }).click()
    await expect(page.locator('textarea[aria-label="输入文本"]')).toHaveValue('')
    await expect(page.getByText('输入文本后，点击"编码"或"解码"查看结果')).toBeVisible()

    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.locator('pre')).toContainText('abc\\u4F60\\u597D')
  })
})