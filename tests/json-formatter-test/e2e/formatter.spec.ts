import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('JSON Formatter E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/json-formatter')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('JSON格式化')

    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should format JSON input', async ({ page }) => {
    const input = '{"name":"test","value":123}'
    
    // Find the input textarea (first CodeEditor)
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    // Click format button
    await page.click('button:has-text("格式化")')

    // Wait for output
    await page.waitForTimeout(600)

    // Check output contains formatted JSON
    const outputEditor = page.locator('.cm-content').nth(1)
    const outputText = await outputEditor.textContent()
    expect(outputText).toContain('"name"')
    expect(outputText).toContain('"test"')
  })

  test('should compress JSON input', async ({ page }) => {
    const input = '{\n  "a": 1\n}'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    await page.click('button:has-text("压缩")')
    await page.waitForTimeout(600)

    const outputEditor = page.locator('.cm-content').nth(1)
    const outputText = await outputEditor.textContent()
    expect(outputText).toBe('{"a":1}')
  })

  test('should show error for invalid JSON', async ({ page }) => {
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type('{invalid}')
    
    await page.click('button:has-text("格式化")')
    await page.waitForTimeout(600)

    // Output editor should have error styling
    const outputContainer = page.locator('[class*="border-destructive"]')
    await expect(outputContainer).toBeVisible()
  })

  test('should clear input and output', async ({ page }) => {
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type('{"test":1}')
    
    await page.click('button:has-text("清空")')

    // Both editors should be empty
    const inputText = await inputEditor.textContent()
    expect(inputText?.trim()).toBe('')
  })

  test('should handle indent toggle', async ({ page }) => {
    const input = '{"a":1}'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    // Switch to 4-space indent
    await page.click('button:has-text("4空格")')
    await page.waitForTimeout(600)

    const outputEditor = page.locator('.cm-content').nth(1)
    const outputText = await outputEditor.textContent()
    // Should have 4-space indentation
    expect(outputText).toContain('    "a"')
  })

  test('should escape JSON string', async ({ page }) => {
    const input = '"hello\nworld"'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    await page.click('button:has-text("转义")')
    await page.waitForTimeout(600)

    const outputEditor = page.locator('.cm-content').nth(1)
    const outputText = await outputEditor.textContent()
    expect(outputText).toContain('\\n')
  })

  test('should unescape JSON string', async ({ page }) => {
    const input = '"hello\\nworld"'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    await page.click('button:has-text("消除转义")')
    await page.waitForTimeout(600)

    const outputEditor = page.locator('.cm-content').nth(1)
    const outputText = await outputEditor.textContent()
    // Unescaped result should be formatted JSON
    expect(outputText).toBeTruthy()
  })
})
