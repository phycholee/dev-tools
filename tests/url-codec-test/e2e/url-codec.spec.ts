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

  test('should enable buttons when input has text', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await expect(page.getByRole('button', { name: '编码' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '解码' })).toBeEnabled()
  })

  test('should show two Cards after clicking encode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('中文 test')
    await page.getByRole('button', { name: '编码' }).click()

    await expect(page.getByText('encodeURIComponent')).toBeVisible()
    await expect(page.getByText('encodeURI', { exact: true })).toBeVisible()
    await expect(page.locator('text=%E4%B8%AD%E6%96%87').first()).toBeVisible()
  })

  test('should show one decode Card after clicking decode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('%E4%B8%AD%E6%96%87')
    await page.getByRole('button', { name: '解码' }).click()

    await expect(page.getByText('解码结果')).toBeVisible()
    await expect(page.locator('text=中文')).toBeVisible()
    await expect(page.getByText('encodeURIComponent')).not.toBeVisible()
  })

  test('should copy encode result and show toast', async ({ page, context }) => {
    // Grant clipboard permission for headless Chromium
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])

    await page.locator('textarea[aria-label="输入文本"]').fill('test')
    await page.getByRole('button', { name: '编码' }).click()

    await page.getByRole('button', { name: '复制' }).first().click()
    await expect(page.locator('text=已复制到剪贴板')).toBeVisible({ timeout: 3000 })
  })

  test('should clear input and result Cards on clear', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.getByText('encodeURIComponent')).toBeVisible()

    await page.getByRole('button', { name: '清除' }).click()

    await expect(page.locator('textarea[aria-label="输入文本"]')).toHaveValue('')
    await expect(page.getByText('encodeURIComponent')).not.toBeVisible()
    await expect(page.getByText('解码结果')).not.toBeVisible()
  })

  test('should show error and no copy button for invalid decode input', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('%GG')
    await page.getByRole('button', { name: '解码' }).click()

    await expect(page.locator('.text-destructive')).toBeVisible()
    // Error branch renders no copy button (component only renders copy in success branch)
    await expect(page.getByRole('button', { name: '复制' })).not.toBeVisible()
  })
})
