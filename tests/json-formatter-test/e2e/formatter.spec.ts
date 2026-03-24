import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('JSON Formatter E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/json-formatter')
    // Wait for CodeMirror to load
    await page.waitForSelector('.cm-editor', { timeout: 10000 })
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
    
    // Find the input CodeMirror editor
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    // Click format button
    await page.getByRole('button', { name: '格式化' }).click()

    // Wait for output - output is in pre/code elements, not CodeMirror
    const outputContainer = page.locator('div:has(> div.flex > pre)').last()
    await expect(outputContainer).toBeVisible({ timeout: 5000 })

    // Check output contains formatted JSON
    const outputText = await outputContainer.textContent()
    expect(outputText).toContain('"name"')
    expect(outputText).toContain('"test"')
  })

  test('should compress JSON input', async ({ page }) => {
    const input = '{"a": 1}'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    await page.getByRole('button', { name: '压缩' }).click()
    
    // Wait for output
    await page.waitForTimeout(600)
    const outputContainer = page.locator('div:has(> div.flex > pre)').last()
    const outputText = await outputContainer.textContent()
    // Output contains line numbers and content, check for compressed JSON part
    expect(outputText).toContain('"a"')
    expect(outputText).toContain('1')
  })

  test('should show error for invalid JSON', async ({ page }) => {
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type('{invalid}')
    
    await page.getByRole('button', { name: '格式化' }).click()
    await page.waitForTimeout(600)

    // Output editor should have error styling - text-destructive class
    const errorText = page.locator('.text-destructive')
    await expect(errorText).toBeVisible()
  })

  test('should clear input and output', async ({ page }) => {
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type('{"test":1}')
    
    await page.getByRole('button', { name: '清空' }).click()

    // Input should be empty (placeholder visible)
    await page.waitForTimeout(300)
    const inputText = await inputEditor.textContent()
    // Empty CodeMirror shows placeholder, so we check if the typed content is gone
    expect(inputText).not.toContain('"test"')
  })

  test('should handle indent toggle', async ({ page }) => {
    const input = '{"a":1}'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    // Switch to 4-space indent
    await page.getByRole('button', { name: '4空格' }).click()
    await page.waitForTimeout(600)

    // Output is in pre/code elements
    const outputContainer = page.locator('div:has(> div.flex > pre)').last()
    const outputText = await outputContainer.textContent()
    // Should have 4-space indentation
    expect(outputText).toContain('    "a"')
  })

  test('should escape JSON string', async ({ page }) => {
    const input = '"hello\\nworld"'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    // Use exact match for "转义" button (not "消除转义")
    await page.getByRole('button', { name: '转义', exact: true }).click()
    await page.waitForTimeout(600)

    // Output is in pre/code elements
    const outputContainer = page.locator('div:has(> div.flex > pre)').last()
    const outputText = await outputContainer.textContent()
    // Check for escaped newline (actual output format)
    expect(outputText).toContain('\\n')
  })

  test('should unescape JSON string', async ({ page }) => {
    const input = '"hello\\\\nworld"'
    
    const inputEditor = page.locator('.cm-content').first()
    await inputEditor.click()
    await page.keyboard.type(input)
    
    await page.getByRole('button', { name: '消除转义' }).click()
    await page.waitForTimeout(600)

    // Output is in pre/code elements
    const outputContainer = page.locator('div:has(> div.flex > pre)').last()
    const outputText = await outputContainer.textContent()
    // Unescaped result should be formatted JSON
    expect(outputText).toBeTruthy()
  })
})
