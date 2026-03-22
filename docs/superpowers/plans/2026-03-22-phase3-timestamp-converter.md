# Phase 3: Timestamp Converter Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full Timestamp Converter tool with real-time current timestamp display, timestamp↔date conversion, timezone support, and batch conversion features.

**Architecture:** Two-layer design: timestamp utility functions (pure logic) → TimestampConverter page (UI orchestration). No external dependencies needed - JavaScript Date API handles all timestamp operations. Timezone support via Intl.DateTimeFormat.

**Tech Stack:** Vue 3.x, TypeScript, Tailwind CSS, shadcn-vue (Button, Badge, Card)

---

## File Structure

```
src/tools/timestamp-converter/
├── timestamp.ts            # Timestamp utility functions (pure logic)
└── TimestampConverter.vue  # Main tool page (all UI in one component)
```

---

## Task 1: Create Timestamp utility functions

**Files:**
- Create: `src/tools/timestamp-converter/timestamp.ts`

- [ ] **Step 1: Create `timestamp.ts` with all timestamp utility functions**

```typescript
/**
 * Timestamp utility functions for conversion and formatting.
 * All functions are pure - no side effects.
 */

export interface TimestampResult {
  success: boolean
  output: string
  error?: string
}

export interface ParsedDateTime {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

/**
 * Common timezone list with UTC offsets
 */
export interface TimezoneOption {
  label: string
  value: string
  offset: string
}

export const TIMEZONES: TimezoneOption[] = [
  { label: 'UTC', value: 'UTC', offset: '+00:00' },
  { label: '北京时间 (CST)', value: 'Asia/Shanghai', offset: '+08:00' },
  { label: '东京时间 (JST)', value: 'Asia/Tokyo', offset: '+09:00' },
  { label: '首尔时间 (KST)', value: 'Asia/Seoul', offset: '+09:00' },
  { label: '新加坡时间 (SGT)', value: 'Asia/Singapore', offset: '+08:00' },
  { label: '洛杉矶时间 (PST)', value: 'America/Los_Angeles', offset: '-08:00' },
  { label: '纽约时间 (EST)', value: 'America/New_York', offset: '-05:00' },
  { label: '伦敦时间 (GMT)', value: 'Europe/London', offset: '+00:00' },
  { label: '巴黎时间 (CET)', value: 'Europe/Paris', offset: '+01:00' },
  { label: '莫斯科时间 (MSK)', value: 'Europe/Moscow', offset: '+03:00' },
  { label: '悉尼时间 (AEST)', value: 'Australia/Sydney', offset: '+11:00' },
]

/**
 * Get current timestamp in seconds and milliseconds
 */
export function getCurrentTimestamps(): { seconds: number; milliseconds: number } {
  const now = Date.now()
  return {
    milliseconds: now,
    seconds: Math.floor(now / 1000)
  }
}

/**
 * Detect if timestamp is in seconds or milliseconds
 * Heuristic: if timestamp is > 10^12, it's milliseconds (year 2001+)
 *            if timestamp is between 10^9 and 10^12, it's seconds (year 2001+)
 */
export function detectTimestampUnit(timestamp: number): 'seconds' | 'milliseconds' {
  // Timestamps after year 2001 in seconds are > 1,000,000,000
  // Timestamps in milliseconds are > 1,000,000,000,000
  if (timestamp > 1000000000000) {
    return 'milliseconds'
  }
  return 'seconds'
}

/**
 * Convert timestamp to Date object
 * @param timestamp - Unix timestamp
 * @param unit - 'seconds' or 'milliseconds' (auto-detected if not specified)
 */
export function timestampToDate(timestamp: number, unit?: 'seconds' | 'milliseconds'): Date {
  const detectedUnit = unit || detectTimestampUnit(timestamp)
  const ms = detectedUnit === 'seconds' ? timestamp * 1000 : timestamp
  return new Date(ms)
}

/**
 * Convert timestamp to formatted date string in specified timezone
 */
export function timestampToDateString(
  timestamp: number,
  timezone: string = 'Asia/Shanghai',
  unit?: 'seconds' | 'milliseconds'
): TimestampResult {
  try {
    const date = timestampToDate(timestamp, unit)
    
    // Check for invalid date
    if (isNaN(date.getTime())) {
      return {
        success: false,
        output: '',
        error: '无效的时间戳'
      }
    }

    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    return {
      success: true,
      output: formatter.format(date)
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Convert Date to timestamp
 */
export function dateToTimestamp(date: Date, unit: 'seconds' | 'milliseconds' = 'seconds'): number {
  const ms = date.getTime()
  return unit === 'seconds' ? Math.floor(ms / 1000) : ms
}

/**
 * Parse date string to Date object
 * Supports formats: YYYY-MM-DD HH:mm:ss, YYYY/MM/DD HH:mm:ss
 */
export function parseDateString(dateStr: string): Date | null {
  try {
    // Try native parsing first
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date
    }
    
    // Try common formats
    const normalized = dateStr.replace(/\//g, '-')
    const date2 = new Date(normalized)
    if (!isNaN(date2.getTime())) {
      return date2
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Create Date from components
 */
export function createDateFromComponents(components: ParsedDateTime, timezone: string = 'Asia/Shanghai'): Date {
  // Create date string in ISO format
  const dateStr = `${components.year}-${String(components.month).padStart(2, '0')}-${String(components.day).padStart(2, '0')}T${String(components.hours).padStart(2, '0')}:${String(components.minutes).padStart(2, '0')}:${String(components.seconds).padStart(2, '0')}.${String(components.milliseconds).padStart(3, '0')}`
  
  return new Date(dateStr)
}

/**
 * Batch convert timestamps (one per line)
 */
export function batchConvertTimestamps(
  input: string,
  timezone: string = 'Asia/Shanghai',
  unit?: 'seconds' | 'milliseconds'
): TimestampResult {
  try {
    const lines = input.trim().split('\n')
    const results: string[] = []
    const errors: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        results.push('')
        continue
      }

      const timestamp = Number(line)
      if (isNaN(timestamp)) {
        errors.push(`第 ${i + 1} 行: "${line}" 不是有效的时间戳`)
        results.push(`❌ 无效`)
        continue
      }

      const result = timestampToDateString(timestamp, timezone, unit)
      if (result.success) {
        results.push(result.output)
      } else {
        errors.push(`第 ${i + 1} 行: ${result.error}`)
        results.push(`❌ ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      output: results.join('\n'),
      error: errors.length > 0 ? errors.join('; ') : undefined
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Format date to display string with timezone info
 */
export function formatDateTimeWithTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  })
  
  return formatter.format(date)
}

/**
 * Get current date components in specified timezone
 */
export function getCurrentDateInTimezone(timezone: string): ParsedDateTime {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  })
  
  const parts = formatter.formatToParts(now)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'
  
  return {
    year: parseInt(getPart('year')),
    month: parseInt(getPart('month')),
    day: parseInt(getPart('day')),
    hours: parseInt(getPart('hour')),
    minutes: parseInt(getPart('minute')),
    seconds: parseInt(getPart('second')),
    milliseconds: now.getMilliseconds()
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/timestamp-converter/timestamp.ts
git commit -m "feat(timestamp): add timestamp utility functions (convert, format, batch)"
```

---

## Task 2: Create TimestampConverter page

**Files:**
- Modify: `src/tools/timestamp-converter/TimestampConverter.vue`

- [ ] **Step 1: Rewrite TimestampConverter.vue with full functionality**

```vue
<template>
  <div class="flex flex-col h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-[1200px] mx-auto overflow-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-3xl">⏱</span>
      <div>
        <h1 class="text-xl font-bold text-foreground">时间戳转换</h1>
        <p class="text-sm text-muted-foreground">时间戳与日期互转、时区转换</p>
      </div>
    </div>

    <!-- Current Timestamp Display -->
    <Card class="p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-xs">实时</Badge>
          <span class="text-sm text-muted-foreground">当前时间戳</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 font-mono text-sm">
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">秒:</span>
            <code class="bg-muted px-2 py-1 rounded select-all">{{ currentTimestamp.seconds }}</code>
            <Button variant="ghost" size="sm" @click="copyToClipboard(String(currentTimestamp.seconds))">
              复制
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">毫秒:</span>
            <code class="bg-muted px-2 py-1 rounded select-all">{{ currentTimestamp.milliseconds }}</code>
            <Button variant="ghost" size="sm" @click="copyToClipboard(String(currentTimestamp.milliseconds))">
              复制
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Conversion Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Timestamp to Date -->
      <Card class="p-4 flex flex-col gap-4">
        <h2 class="text-lg font-semibold text-foreground">时间戳 → 日期</h2>
        
        <div class="flex flex-col gap-3">
          <div class="flex gap-2">
            <input
              v-model="timestampInput"
              type="text"
              placeholder="输入时间戳，例如: 1710912345"
              class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              @input="convertTimestampToDate"
            />
            <select
              v-model="timestampUnit"
              class="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              @change="convertTimestampToDate"
            >
              <option value="auto">自动检测</option>
              <option value="seconds">秒</option>
              <option value="milliseconds">毫秒</option>
            </select>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">时区:</span>
            <select
              v-model="timezoneForTimestamp"
              class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              @change="convertTimestampToDate"
            >
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }} ({{ tz.offset }})
              </option>
            </select>
          </div>

          <div
            v-if="timestampToDateResult"
            class="p-3 rounded-md"
            :class="timestampToDateResult.success ? 'bg-muted' : 'bg-destructive/10'"
          >
            <div v-if="timestampToDateResult.success" class="font-mono text-sm select-all">
              {{ timestampToDateResult.output }}
            </div>
            <div v-else class="text-destructive text-sm flex items-center gap-2">
              <span>⚠</span>
              <span>{{ timestampToDateResult.error }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Date to Timestamp -->
      <Card class="p-4 flex flex-col gap-4">
        <h2 class="text-lg font-semibold text-foreground">日期 → 时间戳</h2>
        
        <div class="flex flex-col gap-3">
          <input
            v-model="dateInput"
            type="datetime-local"
            class="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            @input="convertDateToTimestamp"
          />
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">时区:</span>
            <select
              v-model="timezoneForDate"
              class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              @change="convertDateToTimestamp"
            >
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }} ({{ tz.offset }})
              </option>
            </select>
          </div>

          <div v-if="dateToTimestampResult" class="p-3 bg-muted rounded-md">
            <div class="flex flex-col gap-2 font-mono text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">秒:</span>
                <code class="select-all">{{ dateToTimestampResult.seconds }}</code>
                <Button variant="ghost" size="sm" @click="copyToClipboard(String(dateToTimestampResult.seconds))">
                  复制
                </Button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">毫秒:</span>
                <code class="select-all">{{ dateToTimestampResult.milliseconds }}</code>
                <Button variant="ghost" size="sm" @click="copyToClipboard(String(dateToTimestampResult.milliseconds))">
                  复制
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Batch Conversion -->
    <Card class="p-4 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-foreground">批量转换</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">时区:</span>
          <select
            v-model="timezoneForBatch"
            class="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
              {{ tz.label }} ({{ tz.offset }})
            </option>
          </select>
          <select
            v-model="batchUnit"
            class="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="auto">自动检测</option>
            <option value="seconds">秒</option>
            <option value="milliseconds">毫秒</option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-muted-foreground">输入 (每行一个时间戳)</label>
          <textarea
            v-model="batchInput"
            placeholder="1710912345&#10;1710912346&#10;1710912347"
            class="h-32 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-sm text-muted-foreground">输出</label>
            <Button
              variant="ghost"
              size="sm"
              :disabled="!batchOutput"
              @click="copyToClipboard(batchOutput)"
            >
              复制全部
            </Button>
          </div>
          <textarea
            v-model="batchOutput"
            readonly
            placeholder="转换结果将显示在这里..."
            class="h-32 px-3 py-2 bg-muted border border-input rounded-md text-sm font-mono resize-none"
          />
        </div>
      </div>
      
      <div class="flex gap-2">
        <Button @click="handleBatchConvert">
          批量转换
        </Button>
        <Button variant="outline" @click="handleBatchClear">
          清空
        </Button>
      </div>
      
      <div
        v-if="batchError"
        class="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm"
      >
        <span>⚠</span>
        <span>{{ batchError }}</span>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  getCurrentTimestamps,
  timestampToDateString,
  dateToTimestamp,
  batchConvertTimestamps,
  detectTimestampUnit,
  TIMEZONES,
  type TimestampResult
} from './timestamp'

const toast = inject<(msg: string) => void>('toast')
const timezones = TIMEZONES

// Current timestamp (real-time)
const currentTimestamp = ref({ seconds: 0, milliseconds: 0 })
let updateInterval: ReturnType<typeof setInterval> | null = null

// Timestamp to Date
const timestampInput = ref('')
const timestampUnit = ref<'auto' | 'seconds' | 'milliseconds'>('auto')
const timezoneForTimestamp = ref('Asia/Shanghai')
const timestampToDateResult = ref<TimestampResult | null>(null)

// Date to Timestamp
const dateInput = ref('')
const timezoneForDate = ref('Asia/Shanghai')
const dateToTimestampResult = ref<{ seconds: number; milliseconds: number } | null>(null)

// Batch conversion
const batchInput = ref('')
const batchOutput = ref('')
const batchError = ref('')
const timezoneForBatch = ref('Asia/Shanghai')
const batchUnit = ref<'auto' | 'seconds' | 'milliseconds'>('auto')

// Initialize current timestamp and start updating
onMounted(() => {
  currentTimestamp.value = getCurrentTimestamps()
  updateInterval = setInterval(() => {
    currentTimestamp.value = getCurrentTimestamps()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// Copy to clipboard
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

// Convert timestamp to date
function convertTimestampToDate() {
  if (!timestampInput.value.trim()) {
    timestampToDateResult.value = null
    return
  }

  const timestamp = Number(timestampInput.value)
  if (isNaN(timestamp)) {
    timestampToDateResult.value = {
      success: false,
      output: '',
      error: '请输入有效的数字'
    }
    return
  }

  const unit = timestampUnit.value === 'auto' ? undefined : timestampUnit.value
  timestampToDateResult.value = timestampToDateString(timestamp, timezoneForTimestamp.value, unit)
}

// Convert date to timestamp
function convertDateToTimestamp() {
  if (!dateInput.value) {
    dateToTimestampResult.value = null
    return
  }

  try {
    const date = new Date(dateInput.value)
    if (isNaN(date.getTime())) {
      dateToTimestampResult.value = null
      return
    }

    dateToTimestampResult.value = {
      seconds: dateToTimestamp(date, 'seconds'),
      milliseconds: dateToTimestamp(date, 'milliseconds')
    }
  } catch {
    dateToTimestampResult.value = null
  }
}

// Batch convert
function handleBatchConvert() {
  batchError.value = ''
  
  if (!batchInput.value.trim()) {
    batchOutput.value = ''
    return
  }

  const unit = batchUnit.value === 'auto' ? undefined : batchUnit.value
  const result = batchConvertTimestamps(batchInput.value, timezoneForBatch.value, unit)
  
  batchOutput.value = result.output
  if (!result.success && result.error) {
    batchError.value = result.error
  }
}

function handleBatchClear() {
  batchInput.value = ''
  batchOutput.value = ''
  batchError.value = ''
}
</script>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/timestamp-converter/TimestampConverter.vue
git commit -m "feat(timestamp): implement full timestamp converter page with all features"
```

---

## Task 3: Visual verification and cleanup

- [ ] **Step 1: Start dev server and visually test**

```bash
npm run dev
```

Navigate to `http://localhost:5173/timestamp-converter` and test:
- [ ] Current timestamp displays and updates every second
- [ ] Enter valid timestamp → shows formatted date
- [ ] Enter invalid timestamp → shows error message
- [ ] Switch timestamp unit (seconds/milliseconds) → output changes
- [ ] Select different timezone → output changes
- [ ] Select datetime → shows both seconds and milliseconds timestamps
- [ ] Batch input with multiple timestamps → all convert correctly
- [ ] Copy buttons work for all copyable values
- [ ] Clear buttons reset inputs

- [ ] **Step 2: Final build verification**

```bash
npm run build
```

- [ ] **Step 3: Update PROJECT_MEMORY.md**

Update Phase 3 status from ⏳ to ✅, add git commits.

- [ ] **Step 4: Create changelog**

Create: `docs/changelog/2026-03-21-timestamp-converter.md`

- [ ] **Step 5: Final commit**

```bash
git add docs/
git commit -m "docs: update changelog and memory for timestamp converter completion"
```

---

## Execution Options

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks

**2. Inline Execution** — Execute tasks in this session using executing-plans

Which approach?
