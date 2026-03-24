import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('JSON Formatter Accessibility', () => {
  test('should meet accessibility requirements', async ({ page }) => {
    await page.goto('/json-formatter')
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
    await page.goto('/json-formatter')

    // Check that action buttons have accessible names
    const formatButton = page.locator('button:has-text("格式化")')
    await expect(formatButton).toBeVisible()

    const compressButton = page.locator('button:has-text("压缩")')
    await expect(compressButton).toBeVisible()

    const escapeButton = page.locator('button:has-text("转义")')
    await expect(escapeButton).toBeVisible()

    const unescapeButton = page.locator('button:has-text("消除转义")')
    await expect(unescapeButton).toBeVisible()
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/json-formatter')

    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('JSON格式化')
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/json-formatter')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    )

    expect(contrastViolations).toHaveLength(0)
  })
})
