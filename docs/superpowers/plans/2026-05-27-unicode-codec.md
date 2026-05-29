# Unicode Codec Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Unicode 编码转换 tool that converts text to JavaScript `\\uXXXX` escapes and decodes valid `\\uXXXX` sequences while preserving invalid sequences.

**Architecture:** Add a focused `unicode-codec` tool following the existing URL/Base64 codec pattern: pure conversion functions in `unicode.ts`, a single Vue page component, registry entry, CSS tool color, and feature-scoped tests. Keep conversion button-triggered, local-only, and scoped to JavaScript `\\uXXXX` escapes.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript strict mode, Tailwind v4/shadcn-vue tokens, Vitest, Playwright, axe-core, existing `useClipboard` composable.

---

## File Structure

- Create `src/tools/unicode-codec/unicode.ts` — pure encode/decode functions and result types.
- Create `src/tools/unicode-codec/UnicodeCodec.vue` — Unicode codec UI, state, buttons, result card, copy/clear behavior.
- Modify `src/tools/registry.ts` — import icon and register `unicode-codec` in 编解码 category.
- Modify `src/assets/styles/globals.css` — add light/dark `--tool-unicode` and Tailwind `--color-tool-unicode` token.
- Modify `src/components/common/ToolCard.vue` — map `unicode-codec` to tool card background and icon color classes.
- Create `tests/unicode-codec-test/unit/unicode.test.ts` — unit tests for conversion rules.
- Create `tests/unicode-codec-test/axe.config.ts` — axe config copied from existing codec tests.
- Create `tests/unicode-codec-test/e2e/unicode-codec.spec.ts` — Playwright interaction tests.
- Create `tests/unicode-codec-test/e2e/axe.spec.ts` — accessibility tests.
- Create `tests/unicode-codec-test/visual/visual.spec.ts` — visual regression states.
- Modify `tests/config.ts` — add `unicode-codec-test` to feature test directories.

---

### Task 1: Unicode Pure Functions

**Files:**
- Create: `src/tools/unicode-codec/unicode.ts`
- Test: `tests/unicode-codec-test/unit/unicode.test.ts`

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unicode-codec-test/unit/unicode.test.ts`:

```ts
// tests/unicode-codec-test/unit/unicode.test.ts
import { describe, it, expect } from 'vitest'
import {
  encodeUnicode,
  decodeUnicode,
} from '../../../src/tools/unicode-codec/unicode'

describe('Unicode Codec Utility', () => {
  describe('encodeUnicode all mode', () => {
    it('should encode ASCII text as UTF-16 code units', () => {
      const result = encodeUnicode('abc', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\u0061\\u0062\\u0063')
    })

    it('should encode mixed ASCII and Chinese text', () => {
      const result = encodeUnicode('abc你好', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\u0061\\u0062\\u0063\\u4F60\\u597D')
    })

    it('should encode spaces and line breaks', () => {
      const result = encodeUnicode('A B\nC', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\u0041\\u0020\\u0042\\u000A\\u0043')
    })

    it('should encode empty string as empty output', () => {
      const result = encodeUnicode('', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })

    it('should encode non-BMP characters as UTF-16 surrogate pairs', () => {
      const result = encodeUnicode('😀', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\uD83D\\uDE00')
    })
  })

  describe('encodeUnicode non-ascii mode', () => {
    it('should keep ASCII text unchanged', () => {
      const result = encodeUnicode('abc', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc')
    })

    it('should encode only non-ASCII characters', () => {
      const result = encodeUnicode('abc你好', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc\\u4F60\\u597D')
    })

    it('should keep ASCII punctuation, spaces, and line breaks unchanged', () => {
      const result = encodeUnicode('a=1 & b=2\nOK', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('a=1 & b=2\nOK')
    })

    it('should encode emoji surrogate pairs and Chinese text', () => {
      const result = encodeUnicode('A😀中', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('A\\uD83D\\uDE00\\u4E2D')
    })
  })

  describe('decodeUnicode', () => {
    it('should decode standard Unicode escape sequences', () => {
      const result = decodeUnicode('\\u4F60\\u597D')
      expect(result.success).toBe(true)
      expect(result.output).toBe('你好')
    })

    it('should decode ASCII escape sequences', () => {
      const result = decodeUnicode('\\u0061\\u0062\\u0063')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc')
    })

    it('should decode mixed plain text and Unicode escape sequences', () => {
      const result = decodeUnicode('abc\\u4F60\\u597D')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc你好')
    })

    it('should decode surrogate pairs into emoji', () => {
      const result = decodeUnicode('\\uD83D\\uDE00')
      expect(result.success).toBe(true)
      expect(result.output).toBe('😀')
    })

    it('should preserve invalid Unicode escape sequences', () => {
      expect(decodeUnicode('\\uZZZZ').output).toBe('\\uZZZZ')
      expect(decodeUnicode('\\u4F6').output).toBe('\\u4F6')
      expect(decodeUnicode('\\u').output).toBe('\\u')
      expect(decodeUnicode('abc\\uZZZZ').output).toBe('abc\\uZZZZ')
    })

    it('should return plain text unchanged', () => {
      const result = decodeUnicode('abc你好')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc你好')
    })

    it('should return empty string for empty input', () => {
      const result = decodeUnicode('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })
  })
})
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run:

```bash
npm run test -- unicode-codec-test/unit/unicode.test.ts
```

Expected: FAIL because `../../../src/tools/unicode-codec/unicode` does not exist.

- [ ] **Step 3: Implement the pure functions**

Create `src/tools/unicode-codec/unicode.ts`:

```ts
/**
 * Unicode encode/decode utility functions.
 * All functions are pure — no side effects.
 */

export interface UnicodeCodecResult {
  success: boolean
  output: string
  error?: string
}

export type UnicodeEncodeMode = 'all' | 'non-ascii'

function toUnicodeEscape(codeUnit: number): string {
  return `\\u${codeUnit.toString(16).toUpperCase().padStart(4, '0')}`
}

/**
 * Encode text to JavaScript Unicode escape sequences.
 * @param input - Plain text to encode
 * @param mode - Whether to encode every character or only non-ASCII characters
 * @returns UnicodeCodecResult with encoded output
 */
export function encodeUnicode(
  input: string,
  mode: UnicodeEncodeMode
): UnicodeCodecResult {
  let output = ''

  for (let i = 0; i < input.length; i++) {
    const codeUnit = input.charCodeAt(i)

    if (mode === 'non-ascii' && codeUnit <= 0x7f) {
      output += input[i]
    } else {
      output += toUnicodeEscape(codeUnit)
    }
  }

  return { success: true, output }
}

/**
 * Decode valid \\uXXXX sequences while preserving invalid sequences as-is.
 * @param input - Text that may contain JavaScript Unicode escape sequences
 * @returns UnicodeCodecResult with decoded output
 */
export function decodeUnicode(input: string): UnicodeCodecResult {
  const output = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  )

  return { success: true, output }
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run:

```bash
npm run test -- unicode-codec-test/unit/unicode.test.ts
```

Expected: PASS for all Unicode codec unit tests.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/tools/unicode-codec/unicode.ts tests/unicode-codec-test/unit/unicode.test.ts
git commit -m "$(cat <<'EOF'
feat(unicode): add codec utilities

Implement JavaScript Unicode escape encoding and mixed-text decoding with tests.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds.

---

### Task 2: Tool UI, Registry, and Styling

**Files:**
- Create: `src/tools/unicode-codec/UnicodeCodec.vue`
- Modify: `src/tools/registry.ts`
- Modify: `src/assets/styles/globals.css`
- Modify: `src/components/common/ToolCard.vue`

- [ ] **Step 1: Create the Vue page component**

Create `src/tools/unicode-codec/UnicodeCodec.vue`:

```vue
<!-- src/tools/unicode-codec/UnicodeCodec.vue -->
<template>
  <div class="flex flex-col p-4 gap-6 w-full max-w-6xl mx-auto" style="min-height: calc(100vh - var(--header-height) - 2rem)">
    <div class="flex items-center gap-3">
      <CaseSensitive class="w-8 h-8 text-tool-unicode" />
      <div>
        <h1 class="text-xl font-bold text-foreground">Unicode编码转换</h1>
        <p class="text-sm text-muted-foreground">字符与 JavaScript Unicode 转义互转</p>
      </div>
    </div>

    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="text-sm text-muted-foreground">
        <strong class="text-foreground">使用提示：</strong>
        <strong>\\uXXXX</strong> 是 JavaScript Unicode 转义格式。
        编码可选择全部字符或仅非 ASCII，解码时非法转义会保持原文。
      </div>
    </div>

    <Card class="p-4">
      <textarea
        v-model="input"
        placeholder="输入字符或 Unicode 转义..."
        class="w-full h-32 px-3 py-2 bg-card border border-input rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        aria-label="输入文本"
        autocomplete="off"
      />

      <div class="flex flex-wrap items-center gap-2 mt-4">
        <span class="text-sm text-muted-foreground">编码策略：</span>
        <Button
          v-for="option in encodeOptions"
          :key="option.value"
          @click="setEncodeMode(option.value)"
          :variant="encodeMode === option.value ? 'default' : 'outline'"
          size="sm"
        >
          {{ option.label }}
        </Button>
      </div>

      <div class="flex items-center gap-3 mt-4">
        <Button @click="handleEncode" variant="default" :disabled="!input.trim()">
          编码
        </Button>
        <Button @click="handleDecode" variant="secondary" :disabled="!input.trim()">
          解码
        </Button>
        <div class="flex-1" />
        <Button @click="handleClear" variant="ghost">
          清除
        </Button>
      </div>
    </Card>

    <Card v-if="result" class="p-4">
      <h2 class="text-sm font-semibold text-foreground mb-3">
        {{ mode === 'encode' ? '编码结果' : '解码结果' }}
      </h2>

      <div class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto">
        <pre class="font-mono text-sm break-all select-all whitespace-pre-wrap flex-1">{{ result.output }}</pre>
        <Button
          variant="ghost"
          size="sm"
          class="shrink-0 hover:bg-background"
          @click="copyToClipboard(result.output)"
        >
          复制
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CaseSensitive } from 'lucide-vue-next'
import { useClipboard } from '@/composables/useClipboard'
import {
  encodeUnicode,
  decodeUnicode,
  type UnicodeCodecResult,
  type UnicodeEncodeMode,
} from './unicode'

type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode | null>(null)
const encodeMode = ref<UnicodeEncodeMode>('non-ascii')
const result = ref<UnicodeCodecResult | null>(null)

const encodeOptions = [
  { value: 'non-ascii' as UnicodeEncodeMode, label: '仅非 ASCII' },
  { value: 'all' as UnicodeEncodeMode, label: '全部字符' },
]

const { copyToClipboard } = useClipboard()

function handleEncode(): void {
  mode.value = 'encode'
  result.value = encodeUnicode(input.value, encodeMode.value)
}

function handleDecode(): void {
  mode.value = 'decode'
  result.value = decodeUnicode(input.value)
}

function setEncodeMode(value: UnicodeEncodeMode): void {
  encodeMode.value = value
  if (mode.value === 'encode' && input.value.trim()) {
    result.value = encodeUnicode(input.value, encodeMode.value)
  }
}

function handleClear(): void {
  input.value = ''
  mode.value = null
  result.value = null
  encodeMode.value = 'non-ascii'
}
</script>
```

- [ ] **Step 2: Register the tool**

Modify `src/tools/registry.ts`:

1. Add `CaseSensitive` to the `lucide-vue-next` import list.
2. Add after `base64-codec`:

```ts
  {
    id: 'unicode-codec',
    name: 'Unicode编码转换',
    path: '/unicode-codec',
    icon: CaseSensitive,
    description: '字符与Unicode转义互转',
    category: '编解码',
    component: () => import('./unicode-codec/UnicodeCodec.vue'),
  },
```

- [ ] **Step 3: Add global tool color tokens**

Modify `src/assets/styles/globals.css`:

```css
  --tool-unicode: oklch(58% 0.16 300);
```

Add the light variable after `--tool-base64`, add the dark variable after dark `--tool-base64` with `oklch(70% 0.16 300)`, and add this `@theme` token after `--color-tool-base64`:

```css
  --color-tool-unicode: var(--tool-unicode);
```

- [ ] **Step 4: Add ToolCard color mappings**

Modify `src/components/common/ToolCard.vue`:

```ts
    'unicode-codec': 'bg-tool-unicode/10 border-tool-unicode/20',
```

and:

```ts
    'unicode-codec': 'text-tool-unicode',
```

- [ ] **Step 5: Run build to verify integration**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/tools/unicode-codec/UnicodeCodec.vue src/tools/registry.ts src/assets/styles/globals.css src/components/common/ToolCard.vue
git commit -m "$(cat <<'EOF'
feat(unicode): add codec tool UI

Register the Unicode codec tool and add its UI, styling tokens, and tool card colors.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds.

---

### Task 3: E2E, Accessibility, and Visual Tests

**Files:**
- Create: `tests/unicode-codec-test/axe.config.ts`
- Create: `tests/unicode-codec-test/e2e/unicode-codec.spec.ts`
- Create: `tests/unicode-codec-test/e2e/axe.spec.ts`
- Create: `tests/unicode-codec-test/visual/visual.spec.ts`
- Modify: `tests/config.ts`

- [ ] **Step 1: Add the axe config**

Create `tests/unicode-codec-test/axe.config.ts` by copying the existing codec axe config:

```ts
// tests/unicode-codec-test/axe.config.ts
import type { AxeResults } from 'axe-core'

export const axeConfig = {
  allowedRules: [
    'color-contrast',
    'html-has-lang',
    'image-alt',
    'link-name',
    'button-name',
    'label',
    'region',
  ],
  excludedRules: [] as string[],
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
}

export function filterAxeResults(results: AxeResults): AxeResults {
  return {
    ...results,
    violations: results.violations.filter(
      (v) => !axeConfig.excludedRules.includes(v.id)
    ),
    passes: results.passes.filter(
      (p) => !axeConfig.excludedRules.includes(p.id)
    ),
  }
}
```

- [ ] **Step 2: Add E2E interaction tests**

Create `tests/unicode-codec-test/e2e/unicode-codec.spec.ts`:

```ts
// tests/unicode-codec-test/e2e/unicode-codec.spec.ts
import { test, expect } from '@playwright/test'
import { ConsoleMonitor } from '../../utils/console'

test.describe('Unicode Codec E2E', () => {
  let consoleMonitor: ConsoleMonitor

  test.beforeEach(async ({ page }) => {
    consoleMonitor = new ConsoleMonitor()
    consoleMonitor.attach(page)
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(() => {
    consoleMonitor.clear()
  })

  test('should load the page without console errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Unicode编码转换')
    const errors = consoleMonitor.getErrors()
    expect(errors).toHaveLength(0)
  })

  test('should disable encode and decode buttons when input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: '编码' })).toBeDisabled()
    await expect(page.getByRole('button', { name: '解码' })).toBeDisabled()
  })

  test('should encode with non-ASCII mode by default', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.getByText('编码结果')).toBeVisible()
    await expect(page.locator('pre')).toContainText('abc\\u4F60\\u597D')
  })

  test('should update encode result when switching to all characters mode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.getByRole('button', { name: '全部字符' }).click()
    await expect(page.locator('pre')).toContainText('\\u0061\\u0062\\u0063\\u4F60\\u597D')
  })

  test('should decode mixed text and Unicode escapes', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc\\u4F60\\u597D')
    await page.getByRole('button', { name: '解码' }).click()
    await expect(page.getByText('解码结果')).toBeVisible()
    await expect(page.locator('pre')).toContainText('abc你好')
  })

  test('should preserve invalid Unicode escapes without error UI', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc\\uZZZZ')
    await page.getByRole('button', { name: '解码' }).click()
    await expect(page.locator('pre')).toContainText('abc\\uZZZZ')
    await expect(page.locator('.text-destructive')).not.toBeVisible()
  })

  test('should copy result and show toast', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions only supported in Chromium')
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.getByRole('button', { name: '复制' }).click()
    await expect(page.locator('text=已复制到剪贴板')).toBeVisible({ timeout: 3000 })
  })

  test('should clear input, result, and reset encode mode', async ({ page }) => {
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.getByRole('button', { name: '全部字符' }).click()
    await page.getByRole('button', { name: '清除' }).click()
    await expect(page.locator('textarea[aria-label="输入文本"]')).toHaveValue('')
    await expect(page.getByText('编码结果')).not.toBeVisible()

    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await expect(page.locator('pre')).toContainText('abc\\u4F60\\u597D')
  })
})
```

- [ ] **Step 3: Add accessibility tests**

Create `tests/unicode-codec-test/e2e/axe.spec.ts`:

```ts
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
```

- [ ] **Step 4: Add visual regression tests**

Create `tests/unicode-codec-test/visual/visual.spec.ts`:

```ts
// tests/unicode-codec-test/visual/visual.spec.ts
import { test, expect } from '@playwright/test'
import { ScreenshotComparator } from '../../utils/screenshot'

test.describe('Unicode Codec Visual', () => {
  const comparator = new ScreenshotComparator(
    'tests/unicode-codec-test/visual/baseline',
    'tests/report/visual'
  )

  test('initial empty state', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-empty', screenshot)
    expect(result.match).toBe(true)
  })

  test('encode result state', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('abc你好')
    await page.getByRole('button', { name: '编码' }).click()
    await page.waitForTimeout(300)
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-encode', screenshot)
    expect(result.match).toBe(true)
  })

  test('decode result state', async ({ page }) => {
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('abc\\u4F60\\u597D')
    await page.getByRole('button', { name: '解码' }).click()
    await page.waitForTimeout(300)
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-decode', screenshot)
    expect(result.match).toBe(true)
  })

  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/unicode-codec')
    await page.waitForLoadState('networkidle')
    await page.locator('textarea[aria-label="输入文本"]').fill('A😀中')
    await page.getByRole('button', { name: '编码' }).click()
    await page.waitForTimeout(300)
    const screenshot = await page.screenshot()
    const result = await comparator.compare('unicode-codec-mobile', screenshot)
    expect(result.match).toBe(true)
  })
})
```

- [ ] **Step 5: Register the test directory**

Modify `tests/config.ts`:

```ts
  testDirs: [
    'json-formatter-test',
    'timestamp-converter-test',
    'url-codec-test',
    'cron-parser-test',
    'base64-codec-test',
    'unicode-codec-test',
  ],
```

- [ ] **Step 6: Run E2E, axe, and visual tests for this tool**

Run:

```bash
npm run test:e2e -- unicode-codec-test
```

Expected: PASS. On the first visual run, baselines are created under `tests/unicode-codec-test/visual/baseline` and visual tests pass.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
git add tests/unicode-codec-test tests/config.ts
git commit -m "$(cat <<'EOF'
test(unicode): add codec coverage

Cover Unicode codec behavior with Playwright, accessibility, and visual regression tests.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds.

---

### Task 4: Final Verification and Spec Status

**Files:**
- Modify: `docs/superpowers/specs/2026-05-27-unicode-codec-design.md`

- [ ] **Step 1: Update spec status after implementation passes**

Modify the header in `docs/superpowers/specs/2026-05-27-unicode-codec-design.md`:

```markdown
**状态:** 已实现  
```

- [ ] **Step 2: Run all required verification commands**

Run:

```bash
npm run test
npm run test:e2e
npm run build
```

Expected: all commands PASS.

- [ ] **Step 3: Manually verify the UI in the browser**

Run:

```bash
npm run dev
```

Open `/unicode-codec` and verify:

1. Page title is `Unicode编码转换`.
2. `abc你好` encodes by default to `abc\\u4F60\\u597D`.
3. Switching to `全部字符` updates output to `\\u0061\\u0062\\u0063\\u4F60\\u597D`.
4. `abc\\u4F60\\u597D` decodes to `abc你好`.
5. `abc\\uZZZZ` stays `abc\\uZZZZ` with no error state.
6. `清除` empties input/result and restores `仅非 ASCII`.

Stop the dev server after verification.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
git add docs/superpowers/specs/2026-05-27-unicode-codec-design.md
git commit -m "$(cat <<'EOF'
docs(unicode): mark codec spec implemented

Update the Unicode codec design status after implementation and verification.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds.

---

## Self-Review Notes

- Spec coverage: Tasks cover pure encoding/decoding, invalid escape preservation, default non-ASCII mode, manual button-triggered conversion, copy/clear behavior, registry visibility, route access, tool colors, E2E, axe, visual, and final build/test verification.
- Completeness scan: No `TBD`, `TODO`, incomplete markers, or unspecified “write tests” steps remain.
- Type consistency: `UnicodeCodecResult`, `UnicodeEncodeMode`, `encodeUnicode`, and `decodeUnicode` are defined in Task 1 and reused consistently in Task 2.
