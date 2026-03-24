import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('Timestamp Converter E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/timestamp-converter')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('时间戳转换')

    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should display current timestamp', async ({ page }) => {
    // Check that current timestamp section exists
    await expect(page.locator('text=当前时间')).toBeVisible()
    
    // Check that timestamp is displayed
    const timestampDisplay = page.locator('text=/\\d{13}/')
    await expect(timestampDisplay).toBeVisible()
  })

  test('should convert timestamp to date', async ({ page }) => {
    // Find timestamp input
    const input = page.locator('input[placeholder*="时间戳"]')
    await input.fill('1710912345')

    // Wait for conversion
    await page.waitForTimeout(500)

    // Check output contains a date
    const outputArea = page.locator('.bg-muted').first()
    const outputText = await outputArea.textContent()
    expect(outputText).toContain('2024')
  })

  test('should convert date to timestamp', async ({ page }) => {
    // Find date input
    const input = page.locator('input[placeholder*="yyyy-MM-dd"]')
    await input.fill('2024-03-20 12:00:00')

    // Wait for conversion
    await page.waitForTimeout(500)

    // Check output contains timestamp
    const outputArea = page.locator('.bg-muted').nth(1)
    const outputText = await outputArea.textContent()
    expect(outputText).toMatch(/\d{10,}/)
  })

  test('should show error for invalid date format', async ({ page }) => {
    const input = page.locator('input[placeholder*="yyyy-MM-dd"]')
    await input.fill('invalid-date')

    await page.waitForTimeout(500)

    // Input should have error styling
    const inputWithBorder = page.locator('input.border-destructive')
    await expect(inputWithBorder).toBeVisible()
  })

  test('should perform batch conversion', async ({ page }) => {
    // Find batch input textarea
    const batchInput = page.locator('textarea').first()
    await batchInput.fill('1710912345\n1710912346\n1710912347')

    // Click batch convert button
    await page.click('button:has-text("批量转换")')

    // Check output
    const batchOutput = page.locator('textarea[readonly]')
    const outputText = await batchOutput.inputValue()
    expect(outputText.split('\n')).toHaveLength(3)
  })

  test('should clear batch input and output', async ({ page }) => {
    const batchInput = page.locator('textarea').first()
    await batchInput.fill('1710912345')

    await page.click('button:has-text("批量转换")')
    await page.click('button:has-text("清空")')

    const batchOutput = page.locator('textarea[readonly]')
    await expect(batchInput).toHaveValue('')
    await expect(batchOutput).toHaveValue('')
  })

  test('should change timezone for timestamp conversion', async ({ page }) => {
    const input = page.locator('input[placeholder*="时间戳"]')
    await input.fill('1710912345')

    // Select UTC timezone
    const timezoneSelect = page.locator('text=时区:').first().locator('..').locator('[role="combobox"]')
    await timezoneSelect.click()
    await page.click('[role="option"]:has-text("UTC")')

    await page.waitForTimeout(500)

    // Output should show UTC time
    const outputArea = page.locator('.bg-muted').first()
    const outputText = await outputArea.textContent()
    expect(outputText).toBeTruthy()
  })
})
