# AI Testing Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up automated testing infrastructure for AI development workflow with Vitest, Playwright, and axe-core

**Architecture:** Establish test infrastructure with separate directories per feature (unit/e2e/visual), centralized config management, and automated server lifecycle handling. Tests run against local dev server with automatic startup/shutdown.

**Tech Stack:** Vitest, Playwright, axe-core, pixelmatch, vue-sonner (existing)

---

## File Structure

```
tests/                                    # New test root directory
├── config.ts                             # Central test configuration
├── package.json                          # Test dependencies
├── utils/
│   ├── server.ts                         # Dev server lifecycle management
│   ├── reporter.ts                       # HTML report generation
│   ├── screenshot.ts                     # Visual comparison utilities
│   └── console.ts                        # Console error detection
├── json-formatter-test/
│   ├── unit/
│   │   ├── json.test.ts                  # Utility function tests
│   │   └── json.test.ts.snap             # Snapshot file (auto-generated)
│   ├── e2e/
│   │   └── formatter.spec.ts             # Page interaction tests
│   └── visual/
│       └── baseline/                     # Baseline screenshots (auto-populated)
├── timestamp-converter-test/
│   ├── unit/
│   ├── e2e/
│   └── visual/
│       └── baseline/
└── vitest.config.ts                      # Vitest configuration
playwright.config.ts                      # Playwright configuration
```

---

## Task 1: Initialize Test Infrastructure

**Files:**
- Create: `tests/package.json` - Test dependencies
- Create: `tests/vitest.config.ts` - Vitest configuration
- Create: `tests/playwright.config.ts` - Playwright configuration
- Create: `tests/config.ts` - Test configuration
- Create: `tests/tsconfig.json` - TypeScript config for tests
- Modify: `package.json` - Add test scripts

- [ ] **Step 1: Create tests/package.json**

```json
{
  "name": "devtools-tests",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:visual": "playwright test --grep visual",
    "test:all": "vitest run && playwright test",
    "test:server": "node tests/utils/server.js",
    "test:report": "node tests/utils/reporter.js"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.9.0",
    "@playwright/test": "^1.42.0",
    "playwright": "^1.42.0",
    "vitest": "^1.4.0",
    "pixelmatch": "^5.3.0",
    "pngjs": "^7.0.0"
  }
}
```

- [ ] **Step 2: Create tests/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/visual/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/tools/**/*.ts'],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create tests/playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test'
import path from 'path'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/report/html' }],
    ['json', { outputFile: 'tests/report/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

- [ ] **Step 4: Create tests/config.ts**

```typescript
export const testConfig = {
  // Development server configuration
  devServer: {
    url: 'http://localhost:5173',
    timeout: 60000,
    healthCheckInterval: 1000,
    startupTimeout: 120000,
  },

  // Browser configuration
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    slowMo: 0,
  },

  // Test timeout configuration
  timeouts: {
    unit: 30000,
    e2e: 60000,
    visual: 30000,
    axe: 30000,
  },

  // Visual comparison threshold
  visual: {
    diffThreshold: 0.01, // 1% pixel difference
    baselineDir: 'tests/visual/baseline',
    outputDir: 'tests/report/visual',
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    intervals: [5000, 10000, 15000],
  },

  // Test directories per feature
  testDirs: [
    'json-formatter-test',
    'timestamp-converter-test',
  ],
}
```

- [ ] **Step 5: Create tests/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals", "@playwright/test"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 6: Update root package.json scripts**

Add to scripts section:
```json
"test": "cd tests && npm install && vitest run",
"test:e2e": "cd tests && playwright test",
"test:visual": "cd tests && playwright test --grep visual",
"test:all": "cd tests && vitest run && playwright test",
"test:report": "cd tests && node utils/reporter.js"
```

- [ ] **Step 7: Commit**

```bash
git add tests/package.json tests/vitest.config.ts tests/playwright.config.ts tests/config.ts tests/tsconfig.json package.json
git commit -m "test(infrastructure): add test configuration files"
```

---

## Task 2: Create Test Utilities

**Files:**
- Create: `tests/utils/server.ts` - Dev server lifecycle management
- Create: `tests/utils/reporter.ts` - Test report generation
- Create: `tests/utils/screenshot.ts` - Visual comparison utilities
- Create: `tests/utils/console.ts` - Console error detection

- [ ] **Step 1: Create tests/utils/server.ts**

```typescript
import { spawn, ChildProcess } from 'child_process'
import { request } from 'http'

export class DevServer {
  private process: ChildProcess | null = null
  private url: string

  constructor(url: string = 'http://localhost:5173') {
    this.url = url
  }

  async start(): Promise<void> {
    console.log('Starting dev server...')
    
    return new Promise((resolve, reject) => {
      this.process = spawn('npm', ['run', 'dev'], {
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: '0' },
      })

      let output = ''
      
      this.process.stdout?.on('data', (data) => {
        output += data.toString()
        if (output.includes('Local:') || output.includes('localhost:5173')) {
          resolve()
        }
      })

      this.process.stderr?.on('data', (data) => {
        output += data.toString()
      })

      this.process.on('error', reject)

      // Timeout fallback
      setTimeout(() => {
        if (this.process) {
          resolve()
        }
      }, 30000)
    })
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM')
      this.process = null
      console.log('Dev server stopped')
    }
  }

  async healthCheck(maxAttempts: number = 30): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.request(this.url)
        if (response.statusCode === 200) {
          return true
        }
      } catch {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    return false
  }

  private request(url: string): Promise<{ statusCode: number }> {
    return new Promise((resolve, reject) => {
      const req = request(url, (res) => {
        resolve({ statusCode: res.statusCode || 0 })
      })
      req.on('error', reject)
      req.end()
    })
  }
}
```

- [ ] **Step 2: Create tests/utils/reporter.ts**

```typescript
import fs from 'fs/promises'
import path from 'path'

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  screenshot?: string
}

interface TestReport {
  timestamp: string
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
  results: TestResult[]
}

export class TestReporter {
  private reportDir: string
  private results: TestResult[] = []
  private startTime: number

  constructor(reportDir: string = 'tests/report') {
    this.reportDir = reportDir
    this.startTime = Date.now()
  }

  addResult(result: TestResult): void {
    this.results.push(result)
  }

  async generate(): Promise<string> {
    await fs.mkdir(this.reportDir, { recursive: true })

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      total: this.results.length,
      passed: this.results.filter((r) => r.status === 'passed').length,
      failed: this.results.filter((r) => r.status === 'failed').length,
      skipped: this.results.filter((r) => r.status === 'skipped').length,
      duration: Date.now() - this.startTime,
      results: this.results,
    }

    await fs.writeFile(
      path.join(this.reportDir, 'results.json'),
      JSON.stringify(report, null, 2)
    )

    const html = this.generateHtml(report)
    await fs.writeFile(path.join(this.reportDir, 'index.html'), html)

    return path.join(this.reportDir, 'index.html')
  }

  private generateHtml(report: TestReport): string {
    const statusColor = (status: string) => {
      switch (status) {
        case 'passed': return '#22c55e'
        case 'failed': return '#ef4444'
        default: return '#f59e0b'
      }
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Report - ${report.timestamp}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; background: #0f172a; color: #e2e8f0; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .card { background: #1e293b; padding: 20px; border-radius: 8px; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #334155; }
    th { background: #1e293b; }
    .status { padding: 4px 8px; border-radius: 4px; }
    img { max-width: 400px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>AI Testing Report</h1>
  <p>Generated: ${report.timestamp}</p>
  
  <div class="summary">
    <div class="card">Total: ${report.total}</div>
    <div class="card passed">Passed: ${report.passed}</div>
    <div class="card failed">Failed: ${report.failed}</div>
    <div class="card">Duration: ${(report.duration / 1000).toFixed(2)}s</div>
  </div>

  <table>
    <thead>
      <tr><th>Test</th><th>Status</th><th>Duration</th><th>Details</th></tr>
    </thead>
    <tbody>
      ${report.results.map((r) => `
        <tr>
          <td>${r.name}</td>
          <td><span class="status" style="background: ${statusColor(r.status)}">${r.status}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.error || ''} ${r.screenshot ? `<img src="${r.screenshot}"/>` : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`
  }
}
```

- [ ] **Step 3: Create tests/utils/screenshot.ts**

```typescript
import { mkdir, writeFile, readFile } from 'fs/promises'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

export interface ScreenshotResult {
  match: boolean
  diffRatio: number
  diffImage?: Buffer
}

export class ScreenshotComparator {
  private baselineDir: string
  private outputDir: string

  constructor(baselineDir: string, outputDir: string) {
    this.baselineDir = baselineDir
    this.outputDir = outputDir
  }

  async compare(
    name: string,
    actual: Buffer,
    threshold: number = 0.01
  ): Promise<ScreenshotResult> {
    await mkdir(this.baselineDir, { recursive: true })
    await mkdir(this.outputDir, { recursive: true })

    const baselinePath = `${this.baselineDir}/${name}.png`
    const diffPath = `${this.outputDir}/${name}-diff.png`

    try {
      const baseline = await readFile(baselinePath)
      return await this.doCompare(baseline, actual, diffPath, threshold)
    } catch {
      // First run - create baseline
      await writeFile(baselinePath, actual)
      return { match: true, diffRatio: 0 }
    }
  }

  private async doCompare(
    baseline: Buffer,
    actual: Buffer,
    diffPath: string,
    threshold: number
  ): Promise<ScreenshotResult> {
    const baselinePng = PNG.sync.read(baseline)
    const actualPng = PNG.sync.read(actual)

    const { width, height } = baselinePng
    const diff = new PNG(width, height)

    const numDiffPixels = pixelmatch(
      baselinePng.data,
      actualPng.data,
      diff.data,
      width,
      height,
      { threshold: 0.1, diffColor: [255, 0, 0] }
    )

    const diffRatio = numDiffPixels / (width * height)
    const match = diffRatio <= threshold

    if (!match) {
      await writeFile(diffPath, PNG.sync.write(diff))
    }

    return {
      match,
      diffRatio,
      diffImage: match ? undefined : PNG.sync.write(diff),
    }
  }

  async updateBaseline(name: string, image: Buffer): Promise<void> {
    await writeFile(`${this.baselineDir}/${name}.png`, image)
  }
}
```

- [ ] **Step 4: Create tests/utils/console.ts**

```typescript
import { Page } from '@playwright/test'

export interface ConsoleMessage {
  type: 'error' | 'warn' | 'log' | 'info'
  text: string
  location?: string
}

export class ConsoleMonitor {
  private messages: ConsoleMessage[] = []
  private page: Page | null = null

  attach(page: Page): void {
    this.page = page
    this.messages = []

    page.on('console', (msg) => {
      this.messages.push({
        type: msg.type() as ConsoleMessage['type'],
        text: msg.text(),
        location: msg.location()?.url,
      })
    })

    page.on('pageerror', (error) => {
      this.messages.push({
        type: 'error',
        text: error.message,
        location: error.stack,
      })
    })
  }

  getErrors(): ConsoleMessage[] {
    return this.messages.filter(
      (m) => m.type === 'error' || m.type === 'warn'
    )
  }

  hasErrors(): boolean {
    return this.getErrors().length > 0
  }

  report(): string {
    const errors = this.getErrors()
    if (errors.length === 0) return 'No console errors'

    return errors.map((e) => `[${e.type.toUpperCase()}] ${e.text}`).join('\n')
  }

  clear(): void {
    this.messages = []
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add tests/utils/
git commit -m "test(utils): add test utility modules"
```

---

## Task 3: Create JSON Formatter Unit Tests

**Files:**
- Create: `tests/json-formatter-test/unit/json.test.ts`

- [ ] **Step 1: Create tests/json-formatter-test/unit/json.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import {
  formatJson,
  minifyJson,
  escapeJson,
  unescapeJson,
  isValidJson,
} from '@/tools/json-formatter/json'

describe('JSON Formatter Utility', () => {
  describe('formatJson', () => {
    it('should format valid JSON with default indent', () => {
      const input = '{"name":"test","value":123}'
      const result = formatJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\n')
      expect(result.output).toContain('  "name"')
    })

    it('should format JSON with custom indent', () => {
      const input = '{"a":1}'
      const result = formatJson(input, 4)
      expect(result.success).toBe(true)
      expect(result.output).toContain('    "a"')
    })

    it('should return error for invalid JSON', () => {
      const input = '{invalid}'
      const result = formatJson(input)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty object', () => {
      const result = formatJson('{}')
      expect(result.success).toBe(true)
      expect(result.output).toBe('{\n}')
    })

    it('should handle nested objects', () => {
      const input = '{"outer":{"inner":"value"}}'
      const result = formatJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('"outer"')
      expect(result.output).toContain('"inner"')
    })
  })

  describe('minifyJson', () => {
    it('should minify formatted JSON', () => {
      const input = '{\n  "a": 1\n}'
      const result = minifyJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toBe('{"a":1}')
    })

    it('should return error for invalid JSON', () => {
      const result = minifyJson('invalid')
      expect(result.success).toBe(false)
    })
  })

  describe('escapeJson', () => {
    it('should escape special characters', () => {
      const input = 'hello\nworld'
      const result = escapeJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\\n')
    })

    it('should handle empty string', () => {
      const result = escapeJson('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('""')
    })
  })

  describe('unescapeJson', () => {
    it('should unescape JSON string', () => {
      const input = '"hello\\nworld"'
      const result = unescapeJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\n')
    })
  })

  describe('isValidJson', () => {
    it('should return true for valid JSON', () => {
      expect(isValidJson('{"a":1}')).toBe(true)
      expect(isValidJson('[1,2,3]')).toBe(true)
      expect(isValidJson('"string"')).toBe(true)
      expect(isValidJson('123')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      expect(isValidJson('{invalid}')).toBe(false)
      expect(isValidJson('')).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail (no implementation yet)**

Run: `cd tests && npm install && npx vitest run --reporter=verbose`
Expected: FAIL - Cannot find module '@/tools/json-formatter/json'

- [ ] **Step 3: Commit**

```bash
git add tests/json-formatter-test/unit/json.test.ts
git commit -m "test(json): add unit tests for JSON formatter utilities"
```

---

## Task 4: Create JSON Formatter E2E Tests

**Files:**
- Create: `tests/json-formatter-test/e2e/formatter.spec.ts`

- [ ] **Step 1: Create tests/json-formatter-test/e2e/formatter.spec.ts**

```typescript
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
    await expect(page.locator('h1')).toContainText('JSON')

    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should format JSON input', async ({ page }) => {
    const input = '{"name":"test","value":123}'
    await page.fill('textarea', input)
    await page.click('button:has-text("格式化")')

    const output = page.locator('textarea').nth(1)
    await expect(output).toContainText('"name"')
    await expect(output).toContainText('"test"')
  })

  test('should minify JSON input', async ({ page }) => {
    await page.fill('textarea', '{\n  "a": 1\n}')
    await page.click('button:has-text("压缩")')

    const output = page.locator('textarea').nth(1)
    await expect(output).toHaveValue('{"a":1}')
  })

  test('should show error for invalid JSON', async ({ page }) => {
    await page.fill('textarea', '{invalid}')
    await page.click('button:has-text("格式化")')

    const errorText = page.locator('[class*="error"], .text-destructive')
    await expect(errorText).toBeVisible()
  })

  test('should escape special characters', async ({ page }) => {
    await page.fill('textarea', 'hello\nworld')
    await page.click('button:has-text("转义")')

    const output = page.locator('textarea').nth(1)
    await expect(output).toContainText('\\n')
  })

  test('should unescape JSON string', async ({ page }) => {
    await page.fill('textarea', '"hello\\nworld"')
    await page.click('button:has-text("反转义")')

    const output = page.locator('textarea').nth(1)
    await expect(output).toContainText('\n')
  })
})
```

- [ ] **Step 2: Verify test setup**

Run: `cd tests && npx playwright install chromium`
Expected: Chromium installed

- [ ] **Step 3: Commit**

```bash
git add tests/json-formatter-test/e2e/formatter.spec.ts
git commit -m "test(json): add E2E tests for JSON formatter page"
```

---

## Task 5: Create Visual Regression Test Structure

**Files:**
- Create: `tests/json-formatter-test/visual/baseline/.gitkeep`
- Create: `tests/json-formatter-test/visual/visual.spec.ts`

- [ ] **Step 1: Create tests/json-formatter-test/visual/baseline/.gitkeep**

```
# This directory stores baseline screenshots for visual regression testing
```

- [ ] **Step 2: Create tests/json-formatter-test/visual/visual.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('JSON Formatter Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/json-formatter-test/visual/baseline',
    'tests/report/visual'
  )

  test('main interface layout', async ({ page }) => {
    await page.goto('/json-formatter')
    await page.waitForLoadState('networkidle')

    const screenshot = await page.screenshot()
    const result = await comparator.compare('json-formatter-main', screenshot)

    if (!result.match) {
      console.log(`Visual diff: ${(result.diffRatio * 100).toFixed(2)}%`)
    }

    expect(result.match).toBe(true)
  })

  test('formatted output state', async ({ page }) => {
    await page.goto('/json-formatter')
    await page.fill('textarea', '{"a":1,"b":2}')
    await page.click('button:has-text("格式化")')
    await page.waitForTimeout(500)

    const screenshot = await page.screenshot()
    const result = await comparator.compare('json-formatter-formatted', screenshot)

    expect(result.match).toBe(true)
  })
})
```

- [ ] **Step 3: Commit**

```bash
git add tests/json-formatter-test/visual/
git commit -m "test(json): add visual regression tests for JSON formatter"
```

---

## Task 6: Create Accessibility Test Configuration

**Files:**
- Create: `tests/json-formatter-test/axe.config.ts`
- Create: `tests/json-formatter-test/e2e/axe.spec.ts`

- [ ] **Step 1: Create tests/json-formatter-test/axe.config.ts**

```typescript
import { AxeResults } from '@axe-core/playwright'

export const axeConfig = {
  // WCAG 2.1 AA compliance level
  allowedRules: [
    'color-contrast',
    'html-has-lang',
    'image-alt',
    'link-name',
    'button-name',
    'label',
    'region',
  ],
  // Excluded rules for this specific page
  excludedRules: [],

  // Tags to include
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
}

export function filterAxeResults(results: AxeResults): AxeResults {
  const violations = results.violations.filter((v) =>
    axeConfig.allowedRules.includes(v.id) ||
    !axeConfig.excludedRules.includes(v.id)
  )

  return {
    ...results,
    violations,
    passes: results.passes.filter((p) =>
      axeConfig.allowedRules.includes(p.id) ||
      !axeConfig.excludedRules.includes(p.id)
    ),
  }
}
```

- [ ] **Step 2: Create tests/json-formatter-test/e2e/axe.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { injectAxe, checkAxe, getAxeResults } from '@axe-core/playwright'
import { axeConfig, filterAxeResults } from '../axe.config'

test.describe('JSON Formatter Accessibility', () => {
  test('should meet accessibility requirements', async ({ page }) => {
    await page.goto('/json-formatter')
    await injectAxe(page)

    await checkAxe(page)
    const rawResults = await getAxeResults(page)
    const results = filterAxeResults(rawResults)

    // Log violations for review
    if (results.violations.length > 0) {
      console.log('Accessibility violations:')
      results.violations.forEach((v) => {
        console.log(`  - ${v.id}: ${v.description}`)
      })
    }

    // Fail on critical violations
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Commit**

```bash
git add tests/json-formatter-test/axe.config.ts tests/json-formatter-test/e2e/axe.spec.ts
git commit -m "test(json): add accessibility tests for JSON formatter"
```

---

## Task 7: Add Timestamp Converter Tests (Template)

**Files:**
- Create: `tests/timestamp-converter-test/` - Copy structure from json-formatter-test

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p tests/timestamp-converter-test/unit
mkdir -p tests/timestamp-converter-test/e2e
mkdir -p tests/timestamp-converter-test/visual/baseline
```

- [ ] **Step 2: Create placeholder test files**

Create unit, e2e, visual, and axe test files following the same pattern as JSON formatter tests, adapted for timestamp converter functionality.

- [ ] **Step 3: Commit**

```bash
git add tests/timestamp-converter-test/
git commit -m "test(timestamp): add test structure for timestamp converter"
```

---

## Task 8: Document Testing Workflow

**Files:**
- Create: `tests/README.md` - Testing documentation

- [ ] **Step 1: Create tests/README.md**

```markdown
# Testing Documentation

## Quick Start

```bash
# Install dependencies
npm install

# Install test dependencies
cd tests && npm install && npx playwright install chromium

# Run all tests
npm run test:all

# Run only unit tests
npm run test

# Run only E2E tests
npm run test:e2e

# Run only visual regression tests
npm run test:visual

# Generate test report
npm run test:report
```

## Test Structure

- `tests/config.ts` - Test configuration
- `tests/utils/` - Test utilities (server, reporter, screenshot, console)
- `tests/*-test/` - One directory per feature
  - `unit/` - Unit tests (Vitest)
  - `e2e/` - E2E tests (Playwright)
  - `visual/` - Visual regression tests
  - `axe.config.ts` - Accessibility test configuration

## Adding Tests for New Features

1. Create `tests/<feature>-test/` directory
2. Add unit tests in `unit/`
3. Add E2E tests in `e2e/`
4. Add visual baseline in `visual/baseline/`
5. Configure axe rules in `axe.config.ts`
6. Update `tests/config.ts` to include the new test directory

## CI Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: cd tests && npm install
      - run: npx playwright install chromium
      - run: npm run test:all
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Visual tests failing
```bash
# Update baseline screenshots
cd tests
npx playwright test --grep visual --update-snapshots
```
```

- [ ] **Step 2: Commit**

```bash
git add tests/README.md
git commit -m "docs(testing): add testing documentation"
```

---

## Summary

This plan implements the complete AI testing workflow:

| Task | Description | Files |
|------|-------------|-------|
| 1 | Test infrastructure setup | 6 files |
| 2 | Test utilities | 4 files |
| 3 | JSON formatter unit tests | 1 file |
| 4 | JSON formatter E2E tests | 1 file |
| 5 | Visual regression tests | 2 files |
| 6 | Accessibility tests | 2 files |
| 7 | Timestamp converter tests | 4+ files |
| 8 | Documentation | 1 file |

**Total: ~21 files to create**

**Test Commands:**
- `npm run test` - Unit tests only
- `npm run test:e2e` - E2E tests only
- `npm run test:all` - Full test suite

**Implementation Order:**
1. Tasks 1-2: Infrastructure and utilities (foundation)
2. Tasks 3-6: JSON formatter tests (complete example)
3. Task 7: Timestamp converter (template follow-up)
4. Task 8: Documentation