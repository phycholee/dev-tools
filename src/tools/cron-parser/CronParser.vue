<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  <div class="space-y-6">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl font-semibold">⏰ Cron 表达式解析</span>
      <span class="text-sm text-muted-foreground">Cron表达式可视化与解析工具</span>
    </div>

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

    <!-- 字段选择器 -->
    <Card>
      <CardHeader>
        <CardTitle>字段选择器（双向编辑）</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-5 md:grid-cols-6 gap-4">
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
                class="w-full mt-1 px-2 py-1 bg-background border border-input rounded-md font-mono text-center"
                :class="{ 'border-destructive': !field.valid }"
              />
              <p class="text-xs text-muted-foreground mt-1">{{ field.description }}</p>
            </div>
          </template>
          <template v-else>
            <div class="text-center col-span-5">暂无字段定义</div>
          </template>
        </div>
      </CardContent>
    </Card>

    <!-- 解析结果 -->
    <Card v-if="parseResult?.success">
      <CardHeader>
        <CardTitle>解析结果</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
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
        <div class="flex items-center gap-2">
          <span>📝</span>
          <span>{{ parseResult.description }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- 接下来 5 次执行时间 -->
    <Card v-if="parseResult?.success && parseResult.nextRuns?.length">
      <CardHeader>
        <CardTitle>接下来 5 次执行时间</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-1 font-mono text-sm">
          <li v-for="(run, idx) in parseResult.nextRuns" :key="idx">• {{ formatDate(run) }}</li>
        </ul>
      </CardContent>
    </Card>

    <!-- 今日执行时间线（24h） -->
    <Card v-if="parseResult?.success">
      <CardHeader>
        <CardTitle>今日执行时间线（24h）</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-12 gap-1 items-end">
          <div v-for="hour in 24" :key="hour" class="text-center">
            <div class="text-xs text-muted-foreground">{{ hour - 1 }}</div>
            <div
              class="h-6 rounded mt-1"
              :class="hasExecutionInHour(hour - 1) ? 'bg-primary' : 'bg-muted'"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
