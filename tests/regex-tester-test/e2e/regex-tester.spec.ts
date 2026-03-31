import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('Regex Tester E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/regex-tester')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('正则表达式测试')
    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should highlight matches in real-time', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    const testTextarea = page.locator('textarea[placeholder*="测试"]')

    await patternInput.fill('\\d+')
    await testTextarea.fill('hello 123 world 456')

    // Check that matches are highlighted
    const highlights = page.locator('mark')
    await expect(highlights).toHaveCount(2)
  })

  test('should toggle regex flags', async ({ page }) => {
    const flagG = page.locator('button', { hasText: 'g' })
    const flagI = page.locator('button', { hasText: 'i' })

    // g is enabled by default
    await expect(flagG).toHaveAttribute('data-variant', 'default')
    
    // Click to enable i
    await flagI.click()
    await expect(flagI).toHaveAttribute('data-variant', 'default')
    
    // Click g to disable
    await flagG.click()
    await expect(flagG).toHaveAttribute('data-variant', 'outline')
  })

  test('should apply template', async ({ page }) => {
    const selectTrigger = page.locator('[aria-label="常用模板"]')
    await selectTrigger.click()

    const emailOption = page.locator('[role="option"]', { hasText: '邮箱地址' })
    await emailOption.click()

    const patternInput = page.locator('input[placeholder*="正则"]')
    await expect(patternInput).not.toHaveValue('')
    
    // Test text should also be filled
    const testTextarea = page.locator('textarea[placeholder*="测试"]')
    await expect(testTextarea).not.toHaveValue('')
  })

  test('should show replacement result', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    const testTextarea = page.locator('textarea[placeholder*="测试"]')
    const replacementInput = page.locator('input[placeholder*="替换"]')

    await patternInput.fill('\\d+')
    await testTextarea.fill('hello 123 world')
    await replacementInput.fill('XXX')

    const resultArea = page.locator('text=hello XXX world')
    await expect(resultArea).toBeVisible()
  })

  test('should show validation error for invalid regex', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    await patternInput.fill('[invalid')

    const errorText = page.locator('text=无效的正则表达式')
    await expect(errorText).toBeVisible()
  })

  test('should show regex explanation', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    await patternInput.fill('^\\d+$')

    const explanationCard = page.locator('text=正则解释')
    await expect(explanationCard).toBeVisible()
  })

  test('should show match count', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    const testTextarea = page.locator('textarea[placeholder*="测试"]')

    await patternInput.fill('\\d+')
    await testTextarea.fill('a1 b2 c3')

    const matchCount = page.locator('text=匹配数:')
    await expect(matchCount).toBeVisible()
    await expect(page.locator('strong:text-is("3")')).toBeVisible()
  })

  test('should support capture groups', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    const testTextarea = page.locator('textarea[placeholder*="测试"]')
    const replacementInput = page.locator('input[placeholder*="替换"]')

    await patternInput.fill('(\\d{4})-(\\d{2})-(\\d{2})')
    await testTextarea.fill('2026-03-31')
    await replacementInput.fill('$2/$3/$1')

    const resultArea = page.locator('text=03/31/2026')
    await expect(resultArea).toBeVisible()
  })
})
