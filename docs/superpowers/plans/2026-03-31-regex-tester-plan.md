# Regex Tester Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Regex Tester tool with real-time matching highlight, replacement, templates, explanation, and syntax checking.

**Architecture:** Overlay pattern - transparent textarea over highlight div for "in-place" highlighting. Pure utility functions in regex.ts, component logic in Vue files.

**Tech Stack:** Vue 3 + TypeScript + Tailwind CSS + shadcn-vue

---

## File Structure

```
src/tools/regex-tester/
├── RegexTester.vue      # Main component (layout, state, controls)
├── RegexHighlight.vue   # Overlay highlight editor component
├── regex.ts             # Pure utility functions (match, replace, explain, validate)
└── templates.ts         # Common regex template data

tests/regex-tester-test/
├── unit/
│   └── regex.test.ts    # Unit tests for regex.ts functions
├── e2e/
│   └── regex-tester.spec.ts  # E2E tests for user flows
└── axe.config.ts        # Accessibility config
```

---

### Task 1: Create regex.ts with core utility functions

**Files:**
- Create: `src/tools/regex-tester/regex.ts`
- Test: `tests/regex-tester-test/unit/regex.test.ts`

- [ ] **Step 1: Write the failing unit tests**

```typescript
// tests/regex-tester-test/unit/regex.test.ts
import { describe, it, expect } from 'vitest'
import {
  validateRegex,
  matchRegex,
  replaceRegex,
  explainRegex,
} from '../../../src/tools/regex-tester/regex'

describe('Regex Tester Utility', () => {
  describe('validateRegex', () => {
    it('should return valid for correct regex', () => {
      const result = validateRegex('\\d+', 'g')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid regex', () => {
      const result = validateRegex('[invalid', 'g')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return valid for empty pattern', () => {
      const result = validateRegex('', 'g')
      expect(result.valid).toBe(true)
    })
  })

  describe('matchRegex', () => {
    it('should find basic matches', () => {
      const result = matchRegex('hello 123 world 456', '\\d+', 'g')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(2)
      expect(result.matches[0].value).toBe('123')
      expect(result.matches[0].index).toBe(6)
      expect(result.matches[1].value).toBe('456')
      expect(result.matches[1].index).toBe(16)
    })

    it('should handle case-insensitive flag', () => {
      const result = matchRegex('Hello HELLO hello', 'hello', 'gi')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(3)
    })

    it('should extract capture groups', () => {
      const result = matchRegex('2026-03-31', '(\\d{4})-(\\d{2})-(\\d{2})', 'g')
      expect(result.success).toBe(true)
      expect(result.matches[0].groups).toEqual(['2026', '03', '31'])
    })

    it('should return empty matches for no match', () => {
      const result = matchRegex('hello world', '\\d+', 'g')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(0)
    })

    it('should return error for invalid regex', () => {
      const result = matchRegex('test', '[invalid', 'g')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty text', () => {
      const result = matchRegex('', '\\d+', 'g')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(0)
    })
  })

  describe('replaceRegex', () => {
    it('should replace matches', () => {
      const result = replaceRegex('hello 123 world 456', '\\d+', 'XXX', 'g')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello XXX world XXX')
    })

    it('should support capture group references', () => {
      const result = replaceRegex('2026-03-31', '(\\d{4})-(\\d{2})-(\\d{2})', '$2/$3/$1', 'g')
      expect(result.success).toBe(true)
      expect(result.output).toBe('03/31/2026')
    })

    it('should return original text when no match', () => {
      const result = replaceRegex('hello world', '\\d+', 'XXX', 'g')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello world')
    })

    it('should handle empty replacement', () => {
      const result = replaceRegex('hello 123 world', '\\d+', '', 'g')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello  world')
    })

    it('should return error for invalid regex', () => {
      const result = replaceRegex('test', '[invalid', 'X', 'g')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('explainRegex', () => {
    it('should explain basic patterns', () => {
      const result = explainRegex('^\\d+$')
      expect(result.success).toBe(true)
      expect(result.parts.length).toBeGreaterThan(0)
    })

    it('should explain character classes', () => {
      const result = explainRegex('[a-z]')
      expect(result.success).toBe(true)
      expect(result.parts.length).toBeGreaterThan(0)
    })

    it('should explain quantifiers', () => {
      const result = explainRegex('a{2,5}')
      expect(result.success).toBe(true)
      expect(result.parts.length).toBeGreaterThan(0)
    })

    it('should return error for invalid regex', () => {
      const result = explainRegex('[invalid')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/regex-tester-test/unit/regex.test.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/regex-tester/regex.ts
/**
 * Regex utility functions for matching, replacing, and explaining.
 * All functions are pure - no side effects.
 */

export interface RegexValidation {
  valid: boolean
  error?: string
}

export interface MatchItem {
  value: string
  index: number
  length: number
  groups?: string[]
}

export interface RegexMatchResult {
  success: boolean
  matches: MatchItem[]
  error?: string
}

export interface RegexReplaceResult {
  success: boolean
  output: string
  error?: string
}

export interface RegexPart {
  pattern: string
  description: string
}

export interface RegexExplanation {
  success: boolean
  parts: RegexPart[]
  error?: string
}

/**
 * Validate regex syntax
 */
export function validateRegex(pattern: string, flags: string): RegexValidation {
  try {
    new RegExp(pattern, flags)
    return { valid: true }
  } catch (e) {
    const err = e as Error
    return { valid: false, error: err.message }
  }
}

/**
 * Execute regex matching
 */
export function matchRegex(text: string, pattern: string, flags: string): RegexMatchResult {
  try {
    if (!pattern) {
      return { success: true, matches: [] }
    }
    const regex = new RegExp(pattern, flags)
    const matches: MatchItem[] = []
    let match: RegExpExecArray | null

    if (flags.includes('g')) {
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          value: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.length > 1 ? match.slice(1) : undefined
        })
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }
    } else {
      match = regex.exec(text)
      if (match) {
        matches.push({
          value: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.length > 1 ? match.slice(1) : undefined
        })
      }
    }

    return { success: true, matches }
  } catch (e) {
    const err = e as Error
    return { success: false, matches: [], error: err.message }
  }
}

/**
 * Execute regex replacement
 */
export function replaceRegex(
  text: string,
  pattern: string,
  replacement: string,
  flags: string
): RegexReplaceResult {
  try {
    if (!pattern) {
      return { success: true, output: text }
    }
    const regex = new RegExp(pattern, flags)
    const output = text.replace(regex, replacement)
    return { success: true, output }
  } catch (e) {
    const err = e as Error
    return { success: false, output: '', error: err.message }
  }
}

/**
 * Explain regex pattern
 */
export function explainRegex(pattern: string): RegexExplanation {
  try {
    // Validate first
    new RegExp(pattern)
    
    const parts: RegexPart[] = []
    const explanations: [RegExp, string][] = [
      [/^\\$/, '字符串开头'],
      [/\$$/, '字符串结尾'],
      [/\\\^/, '字符串开头'],
      [/\\\$/, '字符串结尾'],
      [/\\d/, '数字 [0-9]'],
      [/\\D/, '非数字'],
      [/\\w/, '单词字符 [a-zA-Z0-9_]'],
      [/\\W/, '非单词字符'],
      [/\\s/, '空白字符'],
      [/\\S/, '非空白字符'],
      [/\\b/, '单词边界'],
      [/\\B/, '非单词边界'],
      [/\\n/, '换行符'],
      [/\\r/, '回车符'],
      [/\\t/, '制表符'],
      [/\./, '任意字符（除换行符）'],
      [/\[.*?\]/, '字符集合'],
      [/\(\?:/, '非捕获组'],
      [/\(/, '捕获组'],
      [/\)/, '组结束'],
      [/\|/, '或运算'],
      [/\*/, '0次或多次'],
      [/\+/, '1次或多次'],
      [/\?/, '0次或1次'],
      [/\{(\d+)(,)?(\d+)?\}/, '重复次数'],
    ]

    let remaining = pattern
    for (const [regex, desc] of explanations) {
      const match = remaining.match(regex)
      if (match) {
        parts.push({ pattern: match[0], description: desc })
      }
    }

    if (parts.length === 0) {
      parts.push({ pattern, description: '普通字符匹配' })
    }

    return { success: true, parts }
  } catch (e) {
    const err = e as Error
    return { success: false, parts: [], error: err.message }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/regex-tester-test/unit/regex.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/regex-tester/regex.ts tests/regex-tester-test/unit/regex.test.ts
git commit -m "feat(regex-tester): add core regex utility functions"
```

---

### Task 2: Create templates.ts with common regex patterns

**Files:**
- Create: `src/tools/regex-tester/templates.ts`

- [ ] **Step 1: Write templates file**

```typescript
// src/tools/regex-tester/templates.ts

export interface RegexTemplate {
  name: string
  pattern: string
  flags: string
  description: string
  example: string
}

export const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    name: '邮箱地址',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: '匹配标准邮箱地址格式',
    example: 'test@example.com user.name+tag@domain.co.uk'
  },
  {
    name: '手机号 (中国)',
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
    description: '匹配中国大陆11位手机号',
    example: '13812345678 15900001111'
  },
  {
    name: 'URL',
    pattern: 'https?://[^\\s]+',
    flags: 'g',
    description: '匹配HTTP/HTTPS链接',
    example: 'https://example.com/path?q=1 http://localhost:3000'
  },
  {
    name: 'IP地址 (IPv4)',
    pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
    flags: 'g',
    description: '匹配IPv4地址',
    example: '192.168.1.1 10.0.0.1 255.255.255.0'
  },
  {
    name: '日期 (YYYY-MM-DD)',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    description: '匹配日期格式 YYYY-MM-DD',
    example: '2026-03-31 2025-12-01'
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    flags: 'g',
    description: '匹配中文字符',
    example: '你好世界 这是测试文本'
  },
  {
    name: 'HTML标签',
    pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>',
    flags: 'g',
    description: '匹配成对的HTML标签',
    example: '<div>内容</div> <span class="test">文本</span>'
  },
  {
    name: '十六进制颜色',
    pattern: '#[0-9a-fA-F]{6}\\b',
    flags: 'g',
    description: '匹配6位十六进制颜色代码',
    example: '#ff5733 #00ff00 #8b5cf6'
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/tools/regex-tester/templates.ts
git commit -m "feat(regex-tester): add common regex templates"
```

---

### Task 3: Create RegexHighlight.vue component

**Files:**
- Create: `src/tools/regex-tester/RegexHighlight.vue`

- [ ] **Step 1: Write RegexHighlight component**

```vue
<!-- src/tools/regex-tester/RegexHighlight.vue -->
<template>
  <div class="relative w-full h-full min-h-[200px]">
    <!-- Highlight layer -->
    <div
      ref="highlightRef"
      class="absolute inset-0 p-3 font-mono text-sm whitespace-pre-wrap break-words overflow-auto pointer-events-none rounded-md border border-input bg-muted/30"
      aria-hidden="true"
    >
      <template v-for="(segment, i) in segments" :key="i">
        <mark
          v-if="segment.isMatch"
          class="bg-primary/30 text-foreground rounded-sm"
        >{{ segment.text }}</mark>
        <span v-else>{{ segment.text }}</span>
      </template>
    </div>

    <!-- Input layer -->
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      class="relative w-full h-full p-3 font-mono text-sm bg-transparent border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground text-transparent caret-foreground"
      @scroll="syncScroll"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { MatchItem } from './regex'

const props = defineProps<{
  modelValue: string
  matches: MatchItem[]
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const highlightRef = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()

interface Segment {
  text: string
  isMatch: boolean
}

const segments = computed<Segment[]>(() => {
  const text = props.modelValue
  const matches = props.matches

  if (!text) return []
  if (matches.length === 0) return [{ text, isMatch: false }]

  const result: Segment[] = []
  let lastIndex = 0

  for (const match of matches) {
    if (match.index > lastIndex) {
      result.push({ text: text.slice(lastIndex, match.index), isMatch: false })
    }
    result.push({ text: match.value, isMatch: true })
    lastIndex = match.index + match.length
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), isMatch: false })
  }

  return result
})

function syncScroll() {
  if (highlightRef.value && textareaRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
}

onMounted(() => {
  syncScroll()
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/tools/regex-tester/RegexHighlight.vue
git commit -m "feat(regex-tester): add RegexHighlight overlay component"
```

---

### Task 4: Create RegexTester.vue main component

**Files:**
- Create: `src/tools/regex-tester/RegexTester.vue`

- [ ] **Step 1: Write RegexTester main component**

```vue
<!-- src/tools/regex-tester/RegexTester.vue -->
<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-3xl">🔤</span>
      <div>
        <h1 class="text-xl font-bold text-foreground">正则表达式测试</h1>
        <p class="text-sm text-muted-foreground">正则匹配、替换、高亮工具</p>
      </div>
    </div>

    <!-- Pattern Input -->
    <Card class="p-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1 text-muted-foreground">
            <span class="font-mono text-lg">/</span>
          </div>
          <input
            v-model="pattern"
            type="text"
            placeholder="输入正则表达式..."
            class="flex-1 min-w-[200px] px-3 py-2 bg-background border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            :class="!validation.valid ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'"
          />
          <div class="flex items-center gap-1 text-muted-foreground">
            <span class="font-mono text-lg">/</span>
          </div>

          <!-- Flags -->
          <div class="flex items-center gap-1">
            <Button
              v-for="flag in availableFlags"
              :key="flag.value"
              @click="toggleFlag(flag.value)"
              :variant="flags.includes(flag.value) ? 'default' : 'outline'"
              size="sm"
              class="w-8 h-8 font-mono"
              :title="flag.description"
            >
              {{ flag.label }}
            </Button>
          </div>

          <!-- Templates -->
          <Select v-model="selectedTemplate" @update:model-value="applyTemplate">
            <SelectTrigger class="w-[160px]" aria-label="常用模板">
              <SelectValue placeholder="常用模板" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="t in templates" :key="t.name" :value="t.name">
                {{ t.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Validation error -->
        <div
          v-if="!validation.valid && pattern"
          class="flex items-center gap-2 text-destructive text-sm"
        >
          <span>⚠</span>
          <span>{{ validation.error }}</span>
        </div>
      </div>
    </Card>

    <!-- Test Text with Highlight -->
    <Card class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-foreground">测试文本</h2>
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <span>匹配数: <strong class="text-foreground">{{ matchResult.matches.length }}</strong></span>
          <span v-if="matchResult.matches[0]?.groups?.length">
            捕获组: <strong class="text-foreground">{{ matchResult.matches[0].groups.length }}</strong>
          </span>
        </div>
      </div>
      <RegexHighlight
        v-model="testText"
        :matches="matchResult.matches"
        placeholder="输入测试文本..."
      />
    </Card>

    <!-- Replacement -->
    <Card class="p-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted-foreground w-16">替换为:</span>
          <input
            v-model="replacement"
            type="text"
            placeholder="替换文本，支持 $1, $2 引用捕获组..."
            class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div v-if="replacement || replaceResult.output" class="flex items-start gap-3">
          <span class="text-sm text-muted-foreground w-16 shrink-0">结果:</span>
          <div class="flex-1 p-3 rounded-md bg-muted font-mono text-sm min-h-[40px] flex items-start justify-between gap-2">
            <span class="select-all whitespace-pre-wrap break-all">{{ replaceResult.output || testText }}</span>
            <Button
              v-if="replaceResult.output"
              variant="ghost"
              size="sm"
              class="shrink-0 hover:bg-background"
              @click="copyToClipboard(replaceResult.output)"
            >
              复制
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Explanation -->
    <Card v-if="pattern && validation.valid" class="p-4">
      <h2 class="text-sm font-semibold text-foreground mb-3">正则解释</h2>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(part, i) in explanation.parts"
          :key="i"
          class="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
        >
          <code class="font-mono text-primary">{{ part.pattern }}</code>
          <span class="text-muted-foreground">→</span>
          <span>{{ part.description }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RegexHighlight from './RegexHighlight.vue'
import { validateRegex, matchRegex, replaceRegex, explainRegex } from './regex'
import { REGEX_TEMPLATES } from './templates'

const toast = inject<(msg: string) => void>('toast')

const pattern = ref('')
const flags = ref('g')
const testText = ref('')
const replacement = ref('')
const selectedTemplate = ref<string | null>(null)

const templates = REGEX_TEMPLATES

const availableFlags = [
  { value: 'g', label: 'g', description: '全局匹配' },
  { value: 'i', label: 'i', description: '忽略大小写' },
  { value: 'm', label: 'm', description: '多行模式' },
  { value: 's', label: 's', description: '点号匹配换行' },
  { value: 'u', label: 'u', description: 'Unicode模式' },
]

function toggleFlag(flag: string) {
  if (flags.value.includes(flag)) {
    flags.value = flags.value.replace(flag, '')
  } else {
    flags.value += flag
  }
}

const validation = computed(() => validateRegex(pattern.value, flags.value))
const matchResult = computed(() => matchRegex(testText.value, pattern.value, flags.value))
const replaceResult = computed(() => replaceRegex(testText.value, pattern.value, replacement.value, flags.value))
const explanation = computed(() => explainRegex(pattern.value))

function applyTemplate(name: string) {
  const template = templates.find(t => t.name === name)
  if (template) {
    pattern.value = template.pattern
    flags.value = template.flags
    testText.value = template.example
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast?.('已复制到剪贴板')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    toast?.('已复制到剪贴板')
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/tools/regex-tester/RegexTester.vue
git commit -m "feat(regex-tester): add RegexTester main component"
```

---

### Task 5: Register tool in registry

**Files:**
- Modify: `src/tools/registry.ts`

- [ ] **Step 1: Add tool to registry**

```typescript
// Add after existing tools in registry.ts
{
  id: 'regex-tester',
  name: '正则测试',
  path: '/regex-tester',
  icon: '🔤',
  description: '正则表达式匹配、替换、高亮',
  category: '开发辅助',
  component: () => import('./regex-tester/RegexTester.vue'),
  color: '#8b5cf6' // 紫罗兰色
}
```

- [ ] **Step 2: Commit**

```bash
git add src/tools/registry.ts
git commit -m "feat(regex-tester): register tool in registry"
```

---

### Task 6: Add E2E tests

**Files:**
- Create: `tests/regex-tester-test/e2e/regex-tester.spec.ts`

- [ ] **Step 1: Write E2E tests**

```typescript
// tests/regex-tester-test/e2e/regex-tester.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Regex Tester', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/regex-tester')
  })

  test('should display the page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('正则表达式测试')
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

    await flagG.click()
    await flagI.click()

    // Both should be active (default variant)
    await expect(flagG).toHaveAttribute('data-variant', 'default')
    await expect(flagI).toHaveAttribute('data-variant', 'default')
  })

  test('should apply template', async ({ page }) => {
    const selectTrigger = page.locator('[aria-label="常用模板"]')
    await selectTrigger.click()

    const emailOption = page.locator('[role="option"]', { hasText: '邮箱地址' })
    await emailOption.click()

    const patternInput = page.locator('input[placeholder*="正则"]')
    await expect(patternInput).not.toHaveValue('')
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

    const errorText = page.locator('text=/无效|error/i')
    await expect(errorText).toBeVisible()
  })

  test('should show regex explanation', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    await patternInput.fill('^\\d+$')

    const explanationCard = page.locator('text=正则解释')
    await expect(explanationCard).toBeVisible()
  })

  test('should copy replacement result', async ({ page }) => {
    const patternInput = page.locator('input[placeholder*="正则"]')
    const testTextarea = page.locator('textarea[placeholder*="测试"]')
    const replacementInput = page.locator('input[placeholder*="替换"]')

    await patternInput.fill('\\d+')
    await testTextarea.fill('hello 123')
    await replacementInput.fill('XXX')

    const copyButton = page.locator('button', { hasText: '复制' })
    await copyButton.click()

    // Toast should appear
    const toast = page.locator('text=已复制到剪贴板')
    await expect(toast).toBeVisible()
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add tests/regex-tester-test/e2e/regex-tester.spec.ts
git commit -m "test(regex-tester): add E2E tests"
```

---

### Task 7: Run full test suite and fix issues

- [ ] **Step 1: Run unit tests**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 2: Run E2E tests**

Run: `npm run test:e2e`
Expected: All tests pass

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Fix any issues found**

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix(regex-tester): fix test and build issues"
```

---

## Verification Checklist

- [ ] Unit tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] No LSP errors in changed files
- [ ] Tool appears in home page
- [ ] All features work:
  - [ ] Pattern input with syntax validation
  - [ ] Flag toggles (g, i, m, s, u)
  - [ ] Template selection
  - [ ] Real-time match highlighting
  - [ ] Replacement with capture group support
  - [ ] Regex explanation display
  - [ ] Copy to clipboard
