// tests/url-codec-test/e2e/axe.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('URL Codec Accessibility', () => {
  test('should meet WCAG 2.1 AA requirements', async ({ page }) => {
    await page.goto('/url-codec')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze()

    if (results.violations.length > 0) {
      console.log('Accessibility violations:')
      results.violations.forEach((v) => {
        console.log(`  - ${v.id}: ${v.description} (${v.impact})`)
      })
    }

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toHaveLength(0)
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/url-codec')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('URL 编解码')
  })

  test('should have accessible button labels', async ({ page }) => {
    await page.goto('/url-codec')
    await expect(page.getByRole('button', { name: '编码' })).toBeVisible()
    await expect(page.getByRole('button', { name: '解码' })).toBeVisible()
    await expect(page.getByRole('button', { name: '清除' })).toBeVisible()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/url-codec')
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast'
    )
    expect(contrastViolations).toHaveLength(0)
  })
})
