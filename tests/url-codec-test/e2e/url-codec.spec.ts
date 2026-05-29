// tests/url-codec-test/e2e/url-codec.spec.ts
import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('URL Codec E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/url-codec')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('URL 编解码')
    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should disable encode and decode buttons when input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: '编码' })).toBeDisabled()
    await expect(page.getByRole('button', { name: '解码' })).toBeDisabled()
  })

  test('should show format buttons and empty state by default', async ({ page }) => {
    await expect(page.getByText('编码模式：')).toBeVisible()
    const formatButtons = page.locator('button:has-text("encodeURI")')
    await expect(formatButtons).toHaveCount(2)
    await expect(page.getByText('输入文本后，点击"编码"或"解码"查看结果')).toBeVisible()
  })

  test('should enable buttons when input has text', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await expect(page.getByRole('button', { name: '编码' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '解码' })).toBeEnabled()
  })

  test('should show encode result after clicking encode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('中文')
    await page.getByRole('button', { name: '编码' }).click()

    await expect(page.getByText('编码结果')).toBeVisible()
    await expect(page.locator('pre')).toContainText('%E4%B8%AD%E6%96%87')
  })

  test('should switch encode mode and update result', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('https://example.com/中文')
    await page.getByRole('button', { name: '编码' }).click()

    // Default: encodeURIComponent encodes slashes
    await expect(page.locator('pre')).toContainText('%2F')
    await page.getByRole('button', { name: 'encodeURI', exact: true }).click()

    // encodeURI preserves slashes
    await expect(page.locator('pre')).not.toContainText('%2F')
    await expect(page.locator('pre')).toContainText('https://example.com/')
  })

  test('should show decode result after clicking decode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('%E4%B8%AD%E6%96%87')
    await page.getByRole('button', { name: '解码' }).click()

    await expect(page.getByText('解码结果')).toBeVisible()
    await expect(page.locator('pre')).toContainText('中文')
  })

  test('should copy encode result and show toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])

    await page.locator('textarea[aria-label="输入文本"]').fill('test')
    await page.getByRole('button', { name: '编码' }).click()

    await page.getByRole('button', { name: '复制' }).click()
    await expect(page.locator('text=已复制到剪贴板')).toBeVisible({ timeout: 3000 })
  })

  test('should clear input and show empty state', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.getByText('编码结果')).toBeVisible()

    await page.getByRole('button', { name: '清除' }).click()

    await expect(page.locator('textarea[aria-label="输入文本"]')).toHaveValue('')
    await expect(page.getByText('输入文本后，点击"编码"或"解码"查看结果')).toBeVisible()
  })

  test('should show error and no copy button for invalid decode input', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('%GG')
    await page.getByRole('button', { name: '解码' }).click()

    await expect(page.locator('.text-destructive')).toBeVisible()
    await expect(page.getByRole('button', { name: '复制' })).not.toBeVisible()
  })
})