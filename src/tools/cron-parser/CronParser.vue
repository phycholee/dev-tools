<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { parseCron, generateCron, type CronParseResult } from './cron'
import { presets } from './presets'

// Cron input area
const input = ref('')
// Field values for the 5 (sec optional) cron fields
const fields = ref<string[]>(['*', '*', '*', '*', '*'])
const parseResult = ref<CronParseResult | null>(null)
const hasError = ref(false)

// Helpers
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

function hasExecutionInHour(hour: number): boolean {
  if (!parseResult.value?.nextRuns) return false
  const today = new Date()
  return parseResult.value.nextRuns.some((run: Date) => {
    return (
      run.getFullYear() === today.getFullYear() &&
      run.getMonth() === today.getMonth() &&
      run.getDate() === today.getDate() &&
      run.getHours() === hour
    )
  })
}

// Actions
function handleParse() {
  hasError.value = false
  const res = parseCron(input.value)
  parseResult.value = res
  if (res.success && res.fields) {
    // Sync fields from parse result
    fields.value = res.fields.map(f => f.value)
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

// Reactive: keep cron expression in sync with field changes (two-way editing)
watch(fields, (newFields) => {
  try {
    // generateCron expects an array of field strings
    input.value = generateCron(newFields)
    hasError.value = false
    parseResult.value = parseCron(input.value)
  } catch {
    hasError.value = true
  }
}, { deep: true })

// Auto-parse when input changes
watch(input, () => {
  if (input.value.trim()) {
    handleParse()
  }
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

    <!-- Cron 输入 + 常见预设 -->
    <Card class="p-4">
      <div class="flex items-center gap-2 mb-4">
        <h2 class="text-lg font-semibold text-foreground">Cron 表达式</h2>
      </div>
      <div class="space-y-4">
        <div class="flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="*/5 * * * *"
            class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            :class="{ 'border-destructive': hasError }"
          />
          <Button @click="handleParse">解析</Button>
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

    <!-- 字段选择器 + 解析结果 (side by side) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 字段选择器 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">字段选择器（双向编辑）</h2>
        <div class="grid grid-cols-5 md:grid-cols-6 gap-3">
          <template v-if="parseResult?.fields?.length">
            <div
              v-for="(field, index) in parseResult.fields"
              :key="index"
              class="text-center"
            >
              <div class="text-sm font-medium mb-1">{{ field.label }}</div>
              <input
                v-model="fields[index]"
                type="text"
                class="w-full px-2 py-1 bg-background border border-input rounded-md font-mono text-center text-sm"
                :class="{ 'border-destructive': !field.valid }"
              />
              <p class="text-xs text-muted-foreground mt-1">{{ field.description }}</p>
            </div>
          </template>
          <template v-else>
            <div class="text-center col-span-5 text-muted-foreground text-sm">输入 Cron 表达式开始解析</div>
          </template>
        </div>
      </Card>

      <!-- 解析结果 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">解析结果</h2>
        <div v-if="parseResult?.success" class="space-y-4">
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="(field, idx) in parseResult.fields"
              :key="idx"
              class="px-3 py-2 bg-muted rounded-md text-center"
            >
              <div class="text-lg font-mono">{{ field.value }}</div>
              <div class="text-xs text-muted-foreground">{{ field.label }}</div>
              <div class="text-xs">{{ field.description }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span>📝</span>
            <span>{{ parseResult.description }}</span>
          </div>
        </div>
        <div v-else class="text-muted-foreground text-sm">输入 Cron 表达式开始解析</div>
      </Card>
    </div>

    <!-- 接下来 5 次执行时间 + 时间线 (side by side) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 接下来 5 次执行时间 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">接下来 5 次执行时间</h2>
        <ul v-if="parseResult?.success && parseResult.nextRuns?.length" class="space-y-1 font-mono text-sm">
          <li v-for="(run, idx) in parseResult.nextRuns" :key="idx">• {{ formatDate(run) }}</li>
        </ul>
        <div v-else class="text-muted-foreground text-sm">输入 Cron 表达式开始解析</div>
      </Card>

      <!-- 今日执行时间线（24h） -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">今日执行时间线（24h）</h2>
        <div v-if="parseResult?.success" class="grid grid-cols-12 gap-1 items-end">
          <div v-for="hour in 24" :key="hour" class="text-center">
            <div class="text-xs text-muted-foreground">{{ hour - 1 }}</div>
            <div
              class="h-6 rounded mt-1"
              :class="hasExecutionInHour(hour - 1) ? 'bg-primary' : 'bg-muted'"
            />
          </div>
        </div>
        <div v-else class="text-muted-foreground text-sm">输入 Cron 表达式开始解析</div>
      </Card>
    </div>
  </div>
</template>
