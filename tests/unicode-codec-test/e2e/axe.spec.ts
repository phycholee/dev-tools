// tests/unicode-codec-test/e2e/axe.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Unicode Codec Accessibility', () => {
  test('should meet WCAG 2.1 AA requirements', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toHaveLength(0)
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/unicode-codec')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Unicode编码转换')
  })

  test('should have accessible controls', async ({ page }) => {
    await page.goto('/unicode-codec')
    await expect(page.locator('textarea[aria-label="输入文本"]')).toBeVisible()
    await expect(page.getByRole('button', { name: '编码' })).toBeVisible()
    await expect(page.getByRole('button', { name: '解码' })).toBeVisible()
    await expect(page.getByRole('button', { name: '清除' })).toBeVisible()
    await expect(page.getByRole('button', { name: '仅非 ASCII' })).toBeVisible()
    await expect(page.getByRole('button', { name: '全部字符' })).toBeVisible()
  })
})