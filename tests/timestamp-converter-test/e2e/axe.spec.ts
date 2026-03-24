import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Timestamp Converter Accessibility', () => {
  test('should meet accessibility requirements', async ({ page }) => {
    await page.goto('/timestamp-converter')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze()

    // Log violations for review
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:')
      accessibilityScanResults.violations.forEach((v) => {
        console.log(`  - ${v.id}: ${v.description}`)
        console.log(`    Impact: ${v.impact}`)
        console.log(`    Nodes: ${v.nodes.length}`)
      })
    }

    // Fail on critical violations
    const critical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toHaveLength(0)
  })

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/timestamp-converter')

    // Check that action buttons have accessible names
    const batchConvertButton = page.locator('button:has-text("批量转换")')
    await expect(batchConvertButton).toBeVisible()

    const clearButton = page.locator('button:has-text("清空")')
    await expect(clearButton).toBeVisible()
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/timestamp-converter')

    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('时间戳转换')
  })

  test('should have form labels', async ({ page }) => {
    await page.goto('/timestamp-converter')

    // Check for input placeholders
    const timestampInput = page.locator('input[placeholder*="时间戳"]')
    await expect(timestampInput).toBeVisible()

    const dateInput = page.locator('input[placeholder*="yyyy-MM-dd"]')
    await expect(dateInput).toBeVisible()
  })
})
