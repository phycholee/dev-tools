# Cron 表达式解析工具实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Cron 表达式解析工具，支持解析、双向编辑、时间预测和时间线可视化

**Architecture:** 纯前端实现，工具函数与 UI 分离。cron.ts 提供解析/生成/时间计算核心逻辑，CronParser.vue 组合 UI 组件实现交互。遵循项目现有 Result 模式和 shadcn-vue 组件规范。

**Tech Stack:** Vue 3 + TypeScript + Vitest + Playwright + shadcn-vue

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/tools/cron-parser/cron.ts` | 核心工具函数：解析、生成、验证、时间预测 |
| `src/tools/cron-parser/presets.ts` | 常见预设定义 |
| `src/tools/cron-parser/CronParser.vue` | 页面组件：输入、字段选择器、结果展示 |
| `src/tools/registry.ts` | 注册新工具（修改） |
| `tests/cron-parser-test/unit/cron.test.ts` | 单元测试 |
| `tests/cron-parser-test/e2e/cron-parser.spec.ts` | E2E 测试 |
| `tests/cron-parser-test/e2e/axe.spec.ts` | 无障碍测试 |
| `tests/cron-parser-test/visual/visual.spec.ts` | 视觉回归测试 |
| `tests/cron-parser-test/axe.config.ts` | axe 配置 |
| `tests/config.ts` | 测试配置（修改） |

---

## Task 1: 创建 cron.ts 工具函数 + 单元测试

**Files:**
- Create: `src/tools/cron-parser/cron.ts`
- Create: `tests/cron-parser-test/unit/cron.test.ts`

### Step 1: 创建目录结构和接口定义

创建 `src/tools/cron-parser/cron.ts` 骨架：

```typescript
/**
 * Cron 字段解析结果
 */
export interface CronField {
  value: string
  label: string
  description: string
  valid: boolean
  error?: string
}

/**
 * Cron 解析结果
 */
export interface CronParseResult {
  success: boolean
  fields?: CronField[]
  description?: string
  nextRuns?: Date[]
  error?: string
}

// 字段类型定义
type FieldType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'weekday'

// 字段范围
const FIELD_RANGES: Record<FieldType, { min: number; max: number; label: string }> = {
  second: { min: 0, max: 59, label: '秒' },
  minute: { min: 0, max: 59, label: '分' },
  hour: { min: 0, max: 23, label: '时' },
  day: { min: 1, max: 31, label: '日' },
  month: { min: 1, max: 12, label: '月' },
  weekday: { min: 0, max: 6, label: '周' }
}

// 待实现
export function parseCron(expression: string, baseTime?: Date): CronParseResult {
  throw new Error('Not implemented')
}

export function generateCron(fields: string[]): string {
  throw new Error('Not implemented')
}

export function validateField(value: string, fieldType: FieldType): { valid: boolean; error?: string } {
  throw new Error('Not implemented')
}

export function getNextRuns(expression: string, baseTime?: Date, count?: number): Date[] {
  throw new Error('Not implemented')
}
```

- [ ] **Step 1.1: 创建文件骨架**

- [ ] **Step 1.2: 写 validateField 单元测试**

创建 `tests/cron-parser-test/unit/cron.test.ts`：

```typescript
import { describe, it, expect } from 'vitest'
import { validateField } from '@/tools/cron-parser/cron'

describe('validateField', () => {
  it('应接受有效的通配符 *', () => {
    expect(validateField('*', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的步长 */5', () => {
    expect(validateField('*/5', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的确切值 30', () => {
    expect(validateField('30', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的范围 1-5', () => {
    expect(validateField('1-5', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的列表 1,3,5', () => {
    expect(validateField('1,3,5', 'minute')).toEqual({ valid: true })
  })

  it('应拒绝超出范围的值 60（分钟）', () => {
    const result = validateField('60', 'minute')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('范围')
  })

  it('应拒绝非法字符 abc', () => {
    const result = validateField('abc', 'minute')
    expect(result.valid).toBe(false)
  })
})
```

- [ ] **Step 1.3: 运行测试确认失败**

```bash
npm run test -- tests/cron-parser-test/unit/cron.test.ts
```

预期：FAIL - validateField 未实现

- [ ] **Step 1.4: 实现 validateField**

```typescript
export function validateField(value: string, fieldType: FieldType): { valid: boolean; error?: string } {
  const range = FIELD_RANGES[fieldType]

  // 通配符
  if (value === '*') return { valid: true }

  // 步长 */N
  if (value.startsWith('*/')) {
    const n = parseInt(value.slice(2), 10)
    if (isNaN(n) || n <= 0) return { valid: false, error: '步长必须是正整数' }
    return { valid: true }
  }

  // 范围 N-M 或范围+步长 N-M/O
  if (value.includes('-')) {
    const parts = value.split('/')
    const [start, end] = parts[0].split('-').map(v => parseInt(v, 10))
    if (isNaN(start) || isNaN(end)) return { valid: false, error: '范围格式错误' }
    if (start < range.min || end > range.max) {
      return { valid: false, error: `${range.label}范围应为 ${range.min}-${range.max}` }
    }
    if (start > end) return { valid: false, error: '起始值不能大于结束值' }
    return { valid: true }
  }

  // 列表 N,M,O
  if (value.includes(',')) {
    const items = value.split(',').map(v => parseInt(v, 10))
    for (const item of items) {
      if (isNaN(item)) return { valid: false, error: '列表包含非法值' }
      if (item < range.min || item > range.max) {
        return { valid: false, error: `${range.label}范围应为 ${range.min}-${range.max}` }
      }
    }
    return { valid: true }
  }

  // 确切值 N
  const n = parseInt(value, 10)
  if (isNaN(n)) return { valid: false, error: '无效的数值' }
  if (n < range.min || n > range.max) {
    return { valid: false, error: `${range.label}范围应为 ${range.min}-${range.max}` }
  }
  return { valid: true }
}
```

- [ ] **Step 1.5: 运行测试确认通过**

- [ ] **Step 1.6: 写 parseCron 单元测试**

```typescript
import { parseCron } from '@/tools/cron-parser/cron'

describe('parseCron', () => {
  it('应解析 5 位 cron 表达式', () => {
    const result = parseCron('*/5 * * * *')
    expect(result.success).toBe(true)
    expect(result.fields).toHaveLength(5)
  })

  it('应解析 6 位 cron 表达式', () => {
    const result = parseCron('0 */5 * * * *')
    expect(result.success).toBe(true)
    expect(result.fields).toHaveLength(6)
  })

  it('应生成正确的描述 - 每5分钟', () => {
    const result = parseCron('*/5 * * * *')
    expect(result.description).toContain('每 5 分钟')
  })

  it('应生成正确的描述 - 每天午夜', () => {
    const result = parseCron('0 0 * * *')
    expect(result.description).toContain('每天')
    expect(result.description).toContain('00:00')
  })

  it('应拒绝空输入', () => {
    const result = parseCron('')
    expect(result.success).toBe(false)
  })

  it('应拒绝非法格式', () => {
    const result = parseCron('invalid')
    expect(result.success).toBe(false)
  })

  it('应拒绝非 5/6 位格式', () => {
    const result = parseCron('* * *')
    expect(result.success).toBe(false)
    expect(result.error).toContain('5 位或 6 位')
  })
})
```

- [ ] **Step 1.7: 实现 parseCron**

```typescript
export function parseCron(expression: string, baseTime?: Date): CronParseResult {
  if (!expression || !expression.trim()) {
    return { success: false, error: '请输入 cron 表达式' }
  }

  const parts = expression.trim().split(/\s+/)

  if (parts.length !== 5 && parts.length !== 6) {
    return { success: false, error: '请输入 5 位或 6 位 cron 表达式' }
  }

  const isSixFields = parts.length === 6
  const fieldTypes: FieldType[] = isSixFields
    ? ['second', 'minute', 'hour', 'day', 'month', 'weekday']
    : ['minute', 'hour', 'day', 'month', 'weekday']

  const fields: CronField[] = []
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i]
    const fieldType = fieldTypes[i]
    const range = FIELD_RANGES[fieldType]
    const validation = validateField(value, fieldType)

    fields.push({
      value,
      label: range.label,
      description: describeField(value, fieldType),
      valid: validation.valid,
      error: validation.error
    })
  }

  // 检查是否有无效字段
  const invalidField = fields.find(f => !f.valid)
  if (invalidField) {
    return { success: false, error: invalidField.error, fields }
  }

  // 生成描述
  const description = generateDescription(fields, isSixFields)

  // 计算下次执行时间
  const nextRuns = getNextRuns(expression, baseTime, 5)

  return { success: true, fields, description, nextRuns }
}

function describeField(value: string, fieldType: FieldType): string {
  const range = FIELD_RANGES[fieldType]
  if (value === '*') return `每${range.label}`
  if (value.startsWith('*/')) return `每 ${value.slice(2)} ${range.label}`
  if (value.includes('-')) return `${value} 范围`
  if (value.includes(',')) return `${value} 列表`
  return `第 ${value} ${range.label}`
}

function generateDescription(fields: CronField[], isSixFields: boolean): string {
  // 简化的描述生成逻辑
  const minute = fields.find(f => f.label === '分')
  const hour = fields.find(f => f.label === '时')
  const day = fields.find(f => f.label === '日')
  const weekday = fields.find(f => f.label === '周')

  if (minute?.value.startsWith('*/')) {
    return `每 ${minute.value.slice(2)} 分钟执行一次`
  }
  if (minute?.value === '0' && hour?.value !== '*') {
    return `每小时整点执行`
  }
  if (minute?.value === '0' && hour?.value === '0' && day?.value === '*') {
    return `每天午夜执行`
  }

  return '自定义 cron 表达式'
}
```

- [ ] **Step 1.8: 运行测试确认通过**

- [ ] **Step 1.9: 写 getNextRuns 单元测试**

```typescript
import { getNextRuns } from '@/tools/cron-parser/cron'

describe('getNextRuns', () => {
  const baseTime = new Date('2026-03-26T14:32:00')

  it('应计算每分钟执行的下次 5 次时间', () => {
    const runs = getNextRuns('* * * * *', baseTime, 5)
    expect(runs).toHaveLength(5)
    expect(runs[0].getMinutes()).toBe(33) // 下一分钟
  })

  it('应计算每 5 分钟执行的下次时间', () => {
    const runs = getNextRuns('*/5 * * * *', baseTime, 5)
    expect(runs).toHaveLength(5)
    expect(runs[0].getMinutes()).toBe(35) // 14:35
  })

  it('应计算每小时执行的下次时间', () => {
    const runs = getNextRuns('0 * * * *', baseTime, 5)
    expect(runs).toHaveLength(5)
    expect(runs[0].getHours()).toBe(15) // 15:00
  })
})
```

- [ ] **Step 1.10: 实现 getNextRuns**

```typescript
export function getNextRuns(expression: string, baseTime?: Date, count: number = 5): Date[] {
  const result: Date[] = []
  const now = baseTime || new Date()
  let current = new Date(now.getTime() + 1000) // 从下一秒开始

  const parseResult = parseCron(expression, now)
  if (!parseResult.success) return []

  const parts = expression.trim().split(/\s+/)
  const isSixFields = parts.length === 6

  // 简化的实现：遍历查找匹配的时间点
  const maxIterations = 366 * 24 * 60 * 60 // 最多遍历一年
  let iterations = 0

  while (result.length < count && iterations < maxIterations) {
    if (matchesCron(current, parts, isSixFields)) {
      result.push(new Date(current))
    }
    current = new Date(current.getTime() + 1000) // 加一秒
    iterations++
  }

  return result
}

function matchesCron(date: Date, parts: string[], isSixFields: boolean): boolean {
  const values = isSixFields
    ? [date.getSeconds(), date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getDay()]
    : [date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getDay()]

  for (let i = 0; i < parts.length; i++) {
    if (!matchesField(values[i], parts[i])) {
      return false
    }
  }
  return true
}

function matchesField(value: number, pattern: string): boolean {
  if (pattern === '*') return true

  if (pattern.startsWith('*/')) {
    const step = parseInt(pattern.slice(2), 10)
    return value % step === 0
  }

  if (pattern.includes('-')) {
    const parts = pattern.split('/')
    const [start, end] = parts[0].split('-').map(Number)
    if (value < start || value > end) return false
    if (parts.length > 1) {
      const step = parseInt(parts[1], 10)
      return (value - start) % step === 0
    }
    return true
  }

  if (pattern.includes(',')) {
    return pattern.split(',').map(Number).includes(value)
  }

  return value === parseInt(pattern, 10)
}
```

- [ ] **Step 1.11: 运行所有单元测试确认通过**

```bash
npm run test -- tests/cron-parser-test/unit/cron.test.ts
```

- [ ] **Step 1.12: 实现 generateCron 并测试**

```typescript
export function generateCron(fields: string[]): string {
  if (fields.length !== 5 && fields.length !== 6) {
    throw new Error('字段数量必须是 5 或 6')
  }
  return fields.join(' ')
}
```

测试：
```typescript
describe('generateCron', () => {
  it('应从 5 个字段生成 cron', () => {
    expect(generateCron(['*', '*', '*', '*', '*'])).toBe('* * * * *')
  })

  it('应从 6 个字段生成 cron', () => {
    expect(generateCron(['0', '*/5', '*', '*', '*', '*'])).toBe('0 */5 * * * *')
  })
})
```

- [ ] **Step 1.13: Commit**

```bash
git add src/tools/cron-parser/cron.ts tests/cron-parser-test/unit/cron.test.ts
git commit -m "feat(cron-parser): add core utility functions with unit tests"
```

---

## Task 2: 创建 presets.ts 预设定义

**Files:**
- Create: `src/tools/cron-parser/presets.ts`

- [ ] **Step 2.1: 创建预设文件**

```typescript
export interface CronPreset {
  name: string
  expression: string
  description: string
}

export const presets: CronPreset[] = [
  { name: '每分钟', expression: '* * * * *', description: '每分钟执行' },
  { name: '每小时', expression: '0 * * * *', description: '每小时整点执行' },
  { name: '每天午夜', expression: '0 0 * * *', description: '每天 00:00 执行' },
  { name: '每周一', expression: '0 0 * * 1', description: '每周一 00:00 执行' },
  { name: '工作日', expression: '0 9 * * 1-5', description: '工作日上午 9 点执行' },
  { name: '每5分钟', expression: '*/5 * * * *', description: '每 5 分钟执行' }
]
```

- [ ] **Step 2.2: Commit**

```bash
git add src/tools/cron-parser/presets.ts
git commit -m "feat(cron-parser): add common cron presets"
```

---

## Task 3: 创建 CronParser.vue 组件

**Files:**
- Create: `src/tools/cron-parser/CronParser.vue`

- [ ] **Step 3.1: 创建组件骨架**

参考现有工具（如 UrlCodec.vue）的模式，创建 CronParser.vue：

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseCron, generateCron, type CronParseResult } from './cron'
import { presets } from './presets'

const input = ref('')
const fields = ref<string[]>(['*', '*', '*', '*', '*'])
const parseResult = ref<CronParseResult | null>(null)
const hasError = ref(false)

// TODO: 实现双向绑定逻辑
// TODO: 实现 UI
</script>

<template>
  <div class="space-y-6">
    <!-- TODO: 实现 UI 布局 -->
  </div>
</template>
```

- [ ] **Step 3.2: 实现输入区域**

```vue
<template>
  <div class="space-y-6">
    <!-- Cron 输入 -->
    <Card>
      <CardHeader>
        <CardTitle>Cron 表达式输入</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="*/5 * * * *"
            class="flex-1 px-3 py-2 bg-background border border-input rounded-md font-mono"
            :class="{ 'border-destructive': hasError }"
          />
          <Button @click="handleParse">解析</Button>
          <Button variant="outline" @click="handleClear">清除</Button>
        </div>
        <p class="text-sm text-muted-foreground">
          格式：5位（分 时 日 月 周）或 6位（秒 分 时 日 月 周）
        </p>
      </CardContent>
    </Card>

    <!-- 常见预设 -->
    <Card>
      <CardHeader>
        <CardTitle>常见预设</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in presets"
            :key="preset.expression"
            variant="secondary"
            size="sm"
            @click="applyPreset(preset.expression)"
          >
            {{ preset.name }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- TODO: 字段选择器、解析结果、时间线 -->
  </div>
</template>
```

- [ ] **Step 3.3: 实现双向绑定逻辑**

```typescript
// 在 script setup 中添加
function handleParse() {
  hasError.value = false
  parseResult.value = parseCron(input.value)

  if (parseResult.value.success && parseResult.value.fields) {
    fields.value = parseResult.value.fields.map(f => f.value)
  } else {
    hasError.value = true
  }
}

function handleClear() {
  input.value = ''
  fields.value = ['*', '*', '*', '*', '*']
  parseResult.value = null
  hasError.value = false
}

function applyPreset(expression: string) {
  input.value = expression
  handleParse()
}

// 监听 fields 变化，自动生成 cron
watch(fields, (newFields) => {
  try {
    input.value = generateCron(newFields)
    hasError.value = false
    parseResult.value = parseCron(input.value)
  } catch {
    hasError.value = true
  }
}, { deep: true })

// 监听 input 变化，自动解析
watch(input, () => {
  if (input.value.trim()) {
    handleParse()
  }
})
```

- [ ] **Step 3.4: 实现字段选择器**

```vue
<!-- 字段选择器 -->
<Card>
  <CardHeader>
    <CardTitle>字段选择器</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid grid-cols-5 md:grid-cols-6 gap-4">
      <div
        v-for="(field, index) in parseResult?.fields || []"
        :key="index"
        class="text-center"
      >
        <label class="text-sm font-medium">{{ field.label }}</label>
        <input
          v-model="fields[index]"
          type="text"
          class="w-full mt-1 px-2 py-1 bg-background border border-input rounded-md font-mono text-center"
          :class="{ 'border-destructive': !field.valid }"
        />
        <p class="text-xs text-muted-foreground mt-1">{{ field.description }}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 3.5: 实现解析结果展示**

```vue
<!-- 解析结果 -->
<Card v-if="parseResult?.success">
  <CardHeader>
    <CardTitle>解析结果</CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    <!-- 字段卡片 -->
    <div class="flex gap-2 flex-wrap">
      <div
        v-for="(field, index) in parseResult.fields"
        :key="index"
        class="px-3 py-2 bg-muted rounded-md text-center"
      >
        <div class="text-lg font-mono">{{ field.value }}</div>
        <div class="text-xs text-muted-foreground">{{ field.label }}</div>
        <div class="text-xs">{{ field.description }}</div>
      </div>
    </div>

    <!-- 人类可读描述 -->
    <div class="flex items-center gap-2">
      <span>📝</span>
      <span>{{ parseResult.description }}</span>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 3.6: 实现 5 次执行时间展示**

```vue
<!-- 接下来 5 次执行时间 -->
<Card v-if="parseResult?.success && parseResult.nextRuns?.length">
  <CardHeader>
    <CardTitle>接下来 5 次执行时间</CardTitle>
  </CardHeader>
  <CardContent>
    <ul class="space-y-1 font-mono text-sm">
      <li v-for="(run, index) in parseResult.nextRuns" :key="index">
        • {{ formatDate(run) }}
      </li>
    </ul>
  </CardContent>
</Card>
```

添加格式化函数：
```typescript
function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}
```

- [ ] **Step 3.7: 实现时间线热力图**

```vue
<!-- 今日执行时间线 -->
<Card v-if="parseResult?.success">
  <CardHeader>
    <CardTitle>今日执行时间线（24h）</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid grid-cols-12 gap-1">
      <div
        v-for="hour in 24"
        :key="hour"
        class="text-center"
      >
        <div class="text-xs text-muted-foreground">{{ hour - 1 }}</div>
        <div
          class="h-6 rounded"
          :class="hasExecutionInHour(hour - 1) ? 'bg-primary' : 'bg-muted'"
        />
      </div>
    </div>
  </CardContent>
</Card>
```

添加时间线逻辑：
```typescript
function hasExecutionInHour(hour: number): boolean {
  if (!parseResult.value?.nextRuns) return false
  const today = new Date()
  return parseResult.value.nextRuns.some(run =>
    run.getDate() === today.getDate() &&
    run.getMonth() === today.getMonth() &&
    run.getFullYear() === today.getFullYear() &&
    run.getHours() === hour
  )
}
```

- [ ] **Step 3.8: Commit**

```bash
git add src/tools/cron-parser/CronParser.vue
git commit -m "feat(cron-parser): implement CronParser component with full UI"
```

---

## Task 4: 注册工具到 registry.ts

**Files:**
- Modify: `src/tools/registry.ts`

- [ ] **Step 4.1: 添加工具注册**

在 `registry.ts` 的 `tools` 数组中添加：

```typescript
{
  id: 'cron-parser',
  name: 'Cron解析',
  path: '/cron-parser',
  icon: '⏰',
  description: 'Cron表达式解析与可视化',
  category: '开发辅助',
  component: () => import('./cron-parser/CronParser.vue'),
  color: '#f59e0b'
}
```

- [ ] **Step 4.2: 验证路由自动生效**

```bash
npm run dev
```

访问 `http://localhost:5173/cron-parser`，确认页面加载。

- [ ] **Step 4.3: Commit**

```bash
git add src/tools/registry.ts
git commit -m "feat(cron-parser): register tool in registry"
```

---

## Task 5: E2E 测试

**Files:**
- Create: `tests/cron-parser-test/e2e/cron-parser.spec.ts`
- Modify: `tests/config.ts`

- [ ] **Step 5.1: 创建 E2E 测试文件**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Cron 解析工具', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cron-parser')
  })

  test('页面可访问，标题正确', async ({ page }) => {
    await expect(page.getByText('Cron表达式解析与可视化')).toBeVisible()
  })

  test('输入有效 cron 后显示解析结果', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', '*/5 * * * *')
    await page.click('button:has-text("解析")')

    await expect(page.getByText('每 5 分钟')).toBeVisible()
    await expect(page.getByText('接下来 5 次执行时间')).toBeVisible()
  })

  test('点击预设自动填充', async ({ page }) => {
    await page.click('button:has-text("每分钟")')

    const input = page.locator('input[placeholder="*/5 * * * *"]')
    await expect(input).toHaveValue('* * * * *')
  })

  test('输入非法格式显示错误', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', 'invalid')
    await page.click('button:has-text("解析")')

    await expect(page.locator('.border-destructive')).toBeVisible()
  })

  test('点击清除重置所有', async ({ page }) => {
    await page.fill('input[placeholder="*/5 * * * *"]', '*/5 * * * *')
    await page.click('button:has-text("解析")')
    await page.click('button:has-text("清除")')

    const input = page.locator('input[placeholder="*/5 * * * *"]')
    await expect(input).toHaveValue('')
  })
})
```

- [ ] **Step 5.2: 更新 tests/config.ts**

在 `testDirs` 数组中添加 `'cron-parser-test'`。

- [ ] **Step 5.3: 运行 E2E 测试**

```bash
npm run test:e2e -- tests/cron-parser-test/e2e/cron-parser.spec.ts
```

- [ ] **Step 5.4: 修复失败的测试（如有）**

- [ ] **Step 5.5: Commit**

```bash
git add tests/cron-parser-test/e2e/cron-parser.spec.ts tests/config.ts
git commit -m "test(cron-parser): add E2E tests"
```

---

## Task 6: 无障碍测试

**Files:**
- Create: `tests/cron-parser-test/axe.config.ts`
- Create: `tests/cron-parser-test/e2e/axe.spec.ts`

- [ ] **Step 6.1: 创建 axe 配置**

参考现有工具的 `axe.config.ts` 模式。

- [ ] **Step 6.2: 创建无障碍测试**

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Cron 解析工具 - 无障碍', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cron-parser')
  })

  test('应通过 WCAG 2.1 AA 审计', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
```

- [ ] **Step 6.3: 运行测试并修复违规**

```bash
npm run test:e2e -- tests/cron-parser-test/e2e/axe.spec.ts
```

- [ ] **Step 6.4: Commit**

```bash
git add tests/cron-parser-test/axe.config.ts tests/cron-parser-test/e2e/axe.spec.ts
git commit -m "test(cron-parser): add WCAG 2.1 AA accessibility tests"
```

---

## Task 7: 视觉回归测试

**Files:**
- Create: `tests/cron-parser-test/visual/visual.spec.ts`

- [ ] **Step 7.1: 创建视觉回归测试**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Cron 解析工具 - 视觉回归', () => {
  test('初始状态截图', async ({ page }) => {
    await page.goto('/cron-parser')
    await expect(page).toHaveScreenshot('cron-parser-initial.png')
  })

  test('解析后状态截图', async ({ page }) => {
    await page.goto('/cron-parser')
    await page.fill('input[placeholder="*/5 * * * *"]', '*/5 * * * *')
    await page.click('button:has-text("解析")')
    await expect(page).toHaveScreenshot('cron-parser-parsed.png')
  })
})
```

- [ ] **Step 7.2: 生成 baseline 截图**

```bash
npm run test:e2e -- tests/cron-parser-test/visual/visual.spec.ts --update-snapshots
```

- [ ] **Step 7.3: 验证视觉测试通过**

```bash
npm run test:e2e -- tests/cron-parser-test/visual/visual.spec.ts
```

- [ ] **Step 7.4: Commit**

```bash
git add tests/cron-parser-test/visual/
git commit -m "test(cron-parser): add visual regression tests"
```

---

## 最终验证

- [ ] **运行所有测试**

```bash
npm run test
npm run test:e2e
npm run build
```

- [ ] **Commit 变更记录**

```bash
git add docs/changelog/
git commit -m "docs(cron-parser): add changelog entry"
```

---

*计划结束*
