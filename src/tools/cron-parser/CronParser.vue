<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { parseCron, generateCron, type CronParseResult, type CronField } from './cron'
import { presets } from './presets'

// 默认字段定义
const defaultFields: CronField[] = [
  { value: '*', label: '秒', description: '每秒', valid: true },
  { value: '*', label: '分', description: '每分', valid: true },
  { value: '*', label: '时', description: '每时', valid: true },
  { value: '*', label: '日', description: '每日', valid: true },
  { value: '*', label: '月', description: '每月', valid: true },
  { value: '*', label: '周', description: '每周', valid: true }
]

// Cron input area
const input = ref('')
const parseResult = ref<CronParseResult | null>(null)
const hasError = ref(false)

// 显示的字段（默认或解析结果）
const displayFields = computed(() => {
  return parseResult.value?.fields?.length ? parseResult.value.fields : defaultFields
})

// 字段值数组
const fields = ref<string[]>(['*', '*', '*', '*', '*', '*'])

// Helpers
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Actions
function handleParse() {
  if (!input.value.trim()) {
    hasError.value = false
    parseResult.value = null
    return
  }
  const res = parseCron(input.value)
  parseResult.value = res
  hasError.value = !res.success
  if (res.success && res.fields) {
    fields.value = res.fields.map(f => f.value)
  }
}

function handleClear() {
  input.value = ''
  fields.value = ['*', '*', '*', '*', '*', '*']
  parseResult.value = null
  hasError.value = false
}

function handleCopy() {
  if (input.value) {
    navigator.clipboard.writeText(input.value)
  }
}

function applyPreset(expression: string) {
  input.value = expression
  handleParse()
}

// Reactive: keep cron expression in sync with field changes (two-way editing)
watch(fields, (newFields) => {
  try {
    input.value = generateCron(newFields)
    hasError.value = false
    parseResult.value = parseCron(input.value)
  } catch {
    hasError.value = true
  }
}, { deep: true })

// Auto-parse when input changes
watch(input, () => {
  handleParse()
})

</script>

<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-3xl">⏰</span>
      <div>
        <h1 class="text-xl font-bold text-foreground">Cron 表达式解析</h1>
        <p class="text-sm text-muted-foreground">Cron表达式可视化与解析工具</p>
      </div>
    </div>

    <!-- 第一行：Cron 输入 + 常见预设 | 字段选择器 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Cron 输入 + 常见预设 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">Cron 表达式</h2>
        <div class="space-y-4">
          <div class="flex gap-2">
            <input
              v-model="input"
              type="text"
              placeholder="*/5 * * * *"
              class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              :class="{ 'border-destructive': hasError }"
            />
            <Button variant="outline" @click="handleCopy" title="复制">📋</Button>
            <Button variant="outline" @click="handleClear">清除</Button>
          </div>
          <p class="text-sm text-muted-foreground">
            格式：5位（分 时 日 月 周）或 6位（秒 分 时 日 月 周）
          </p>
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
        </div>
      </Card>

      <!-- 字段选择器 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">字段选择器（双向编辑）</h2>
        <div class="grid grid-cols-6 gap-3">
          <div
            v-for="(field, index) in displayFields"
            :key="index"
            class="text-center w-full"
          >
            <div class="text-sm font-medium mb-1">{{ field.label }}</div>
            <input
              v-model="fields[index]"
              type="text"
              class="w-full px-2 py-1 bg-background border border-input rounded-md font-mono text-center text-sm h-8"
              :class="{ 'border-destructive': !field.valid }"
            />
            <p class="text-xs text-muted-foreground mt-1 truncate" :title="field.description">{{ field.description }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- 第二行：解析结果 | 接下来 5 次执行时间 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 解析结果 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">解析结果</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-6 gap-3">
            <div
              v-for="(field, idx) in displayFields"
              :key="idx"
              class="px-2 py-2 bg-muted rounded-md text-center w-full"
            >
              <div class="text-lg font-mono h-6 flex items-center justify-center">{{ field.value }}</div>
              <div class="text-xs text-muted-foreground">{{ field.label }}</div>
              <div class="text-xs truncate" :title="field.description">{{ field.description }}</div>
            </div>
          </div>
          <div v-if="parseResult?.description" class="flex items-center gap-2 text-sm">
            <span>📝</span>
            <span>{{ parseResult.description }}</span>
          </div>
        </div>
      </Card>

      <!-- 接下来 5 次执行时间 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">接下来 5 次执行时间</h2>
        <ul v-if="parseResult?.success && parseResult.nextRuns?.length" class="space-y-1 font-mono text-sm">
          <li v-for="(run, idx) in parseResult.nextRuns" :key="idx">• {{ formatDate(run) }}</li>
        </ul>
        <div v-else class="text-muted-foreground text-sm">输入有效的 Cron 表达式后显示</div>
      </Card>
    </div>
  </div>
</template>
