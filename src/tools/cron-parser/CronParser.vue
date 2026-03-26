<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  parseCron,
  generateCron,
  CRON_FORMATS,
  type CronParseResult,
  type CronField,
  type CronFormat
} from './cron'
import { presetsByFormat } from './presets'

// Cron 格式选择
const selectedFormat = ref<CronFormat>('linux-6')

// 当前格式的预设
const currentPresets = computed(() => {
  return presetsByFormat[selectedFormat.value] || []
})

// 默认字段定义（根据格式动态生成）
const defaultFields = computed<CronField[]>(() => {
  const formatConfig = CRON_FORMATS[selectedFormat.value]
  return formatConfig.fields.map(fieldType => {
    const labels: Record<string, string> = {
      second: '秒', minute: '分', hour: '时',
      day: '日', month: '月', weekday: '周', year: '年'
    }
    return {
      value: '*',
      label: labels[fieldType] || fieldType,
      description: `每${labels[fieldType] || fieldType}`,
      valid: true
    }
  })
})

// Cron input area
const input = ref('')
const parseResult = ref<CronParseResult | null>(null)
const hasError = ref(false)

// 显示的字段（默认或解析结果）
const displayFields = computed(() => {
  return parseResult.value?.fields?.length ? parseResult.value.fields : defaultFields.value
})

// 字段值数组（根据格式动态调整）
const fields = ref<string[]>([])

// 初始化字段值
function initFields() {
  const formatConfig = CRON_FORMATS[selectedFormat.value]
  fields.value = formatConfig.fields.map(() => '*')
}
initFields()

// 格式切换时重置
watch(selectedFormat, () => {
  initFields()
  input.value = ''
  parseResult.value = null
  hasError.value = false
})

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
  const res = parseCron(input.value, undefined, selectedFormat.value)
  parseResult.value = res
  hasError.value = !res.success
  if (res.success && res.fields) {
    fields.value = res.fields.map(f => f.value)
  }
}

function handleClear() {
  input.value = ''
  initFields()
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

// Reactive: keep cron expression in sync with field changes
watch(fields, (newFields) => {
  try {
    input.value = generateCron(newFields)
    hasError.value = false
    parseResult.value = parseCron(input.value, undefined, selectedFormat.value)
  } catch {
    hasError.value = true
  }
}, { deep: true })

// Auto-parse when input changes
watch(input, () => {
  handleParse()
})

// Format change handler for shadcn select
// AcceptableValue from reka-ui can be string | number | bigint | object | null | undefined
function handleFormatChange(value: unknown) {
  if (value && typeof value === 'string') {
    selectedFormat.value = value as CronFormat
  }
}

</script>

<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-3xl">⏰</span>
      <div>
        <h1 class="text-xl font-bold text-foreground">Cron 表达式解析</h1>
        <p class="text-sm text-muted-foreground">支持 Linux 5/6 位和 Quartz/Spring 6/7 位格式</p>
      </div>
    </div>

    <!-- 第一行：Cron 输入 + 字段选择器 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Cron 输入 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">Cron 表达式</h2>
        <div class="space-y-4">
          <!-- 输入框 + 格式选择器 -->
          <div class="flex gap-2">
            <input
              v-model="input"
              type="text"
              :placeholder="CRON_FORMATS[selectedFormat].example"
              class="flex-1 px-3 py-2 bg-background border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              :class="hasError ? 'border-destructive text-destructive' : 'border-input'"
            />
            <Select :model-value="selectedFormat" @update:model-value="handleFormatChange">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="选择格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="(config, key) in CRON_FORMATS"
                    :key="key"
                    :value="key"
                  >
                    {{ config.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <Button variant="outline" @click="handleCopy" :disabled="!input">复制</Button>
            <Button variant="outline" @click="handleClear">清除</Button>
          </div>

          <!-- 格式说明 -->
          <p class="text-sm text-muted-foreground">
            {{ CRON_FORMATS[selectedFormat].name }}：{{ CRON_FORMATS[selectedFormat].fieldCount }} 个字段
          </p>

          <!-- 常见预设（根据格式动态显示） -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-foreground">常用预设</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="preset in currentPresets"
                :key="preset.expression"
                variant="secondary"
                size="sm"
                @click="applyPreset(preset.expression)"
                :title="preset.description"
              >
                {{ preset.name }}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- 字段选择器 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">字段选择器（双向编辑）</h2>
        <div class="grid gap-3" :class="displayFields.length === 5 ? 'grid-cols-5' : displayFields.length === 6 ? 'grid-cols-6' : 'grid-cols-7'">
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

    <!-- 第二行：解析结果 + 执行时间 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 解析结果 -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">解析结果</h2>
        <div class="space-y-4">
          <div class="grid gap-3" :class="displayFields.length === 5 ? 'grid-cols-5' : displayFields.length === 6 ? 'grid-cols-6' : 'grid-cols-7'">
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
          <div v-if="parseResult?.error" class="flex items-center gap-2 text-sm text-destructive">
            <span>⚠️</span>
            <span>{{ parseResult.error }}</span>
          </div>
        </div>
      </Card>

      <!-- 执行时间 -->
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
