// tests/base64-codec-test/e2e/base64-codec.spec.ts
import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('Base64 Codec E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/base64-codec')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Base64编解码')
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

  test('should show format selector when encode mode is active', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await page.getByRole('button', { name: '编码' }).click()
    
    await expect(page.getByRole('button', { name: '标准Base64' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'URL安全' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Base64url' })).toBeVisible()
  })

  test('should encode with standard format by default', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await page.getByRole('button', { name: '编码' }).click()
    
    await expect(page.getByText('编码结果')).toBeVisible()
    await expect(page.locator('text=aGVsbG8=')).toBeVisible()
  })

  test('should switch encoding format', async ({ page }) => {
    // Use input that produces + and / in standard Base64
    await page.locator('textarea[aria-label="输入文本"]').fill('>>>')
    await page.getByRole('button', { name: '编码' }).click()
    
    // Standard format contains +
    await expect(page.locator('text=Pj4+')).toBeVisible()
    
    // Switch to URL-safe: + becomes -, / becomes _
    await page.getByRole('button', { name: 'URL安全' }).click()
    await expect(page.locator('text=Pj4+')).not.toBeVisible()
    await expect(page.locator('text=Pj4-')).toBeVisible()
  })

  test('should decode Base64 string', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('aGVsbG8=')
    await page.getByRole('button', { name: '解码' }).click()
    
    await expect(page.getByText('解码结果')).toBeVisible()
    await expect(page.locator('text=hello')).toBeVisible()
  })

  test('should copy encode result and show toast', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions only supported in Chromium')
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])
    
    await page.locator('textarea[aria-label="输入文本"]').fill('test')
    await page.getByRole('button', { name: '编码' }).click()
    
    await page.getByRole('button', { name: '复制' }).click()
    await expect(page.locator('text=已复制到剪贴板')).toBeVisible({ timeout: 3000 })
  })

  test('should clear input and result on clear', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('hello')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.getByText('编码结果')).toBeVisible()
    
    await page.getByRole('button', { name: '清除' }).click()
    
    await expect(page.locator('textarea[aria-label="输入文本"]')).toHaveValue('')
    await expect(page.getByText('编码结果')).not.toBeVisible()
    await expect(page.getByText('解码结果')).not.toBeVisible()
  })

  test('should show error for invalid Base64 decode input', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('not valid base64!!!')
    await page.getByRole('button', { name: '解码' }).click()
    
    await expect(page.locator('.text-destructive')).toBeVisible()
    await expect(page.getByRole('button', { name: '复制' })).not.toBeVisible()
  })
})
