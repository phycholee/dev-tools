<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Clock class="w-8 h-8 text-tool-timestamp" />
      <div>
        <h1 class="text-xl font-bold text-foreground">时间戳转换</h1>
        <p class="text-sm text-muted-foreground">时间戳与日期互转、时区转换</p>
      </div>
    </div>

    <!-- Help tip -->
    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="flex items-start gap-2">
        <span class="text-muted-foreground text-sm">💡</span>
        <div class="text-sm text-muted-foreground">
          <strong class="text-foreground">使用提示：</strong> 
          支持秒和毫秒时间戳，自动检测格式。可选择时区进行转换。批量转换支持多行时间戳（每行一个）。
          <span class="text-xs opacity-75 ml-2">示例：1710912345000 → 2024-03-20 10:05:45</span>
        </div>
      </div>
    </div>

    <!-- Current Timestamp Display -->
    <Card class="p-4">
      <div class="flex items-center gap-2 mb-4">
        <h2 class="text-lg font-semibold text-foreground">当前时间</h2>
        <Badge variant="outline" class="text-xs">实时</Badge>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-4 font-mono text-sm">
          <span class="text-muted-foreground w-10">时间</span>
          <span class="select-all">{{ currentTimeFormatted }}</span>
          <Button variant="ghost" size="sm" class="ml-1" @click="copyToClipboard(currentTimeFormatted)">
            复制
          </Button>
        </div>
        <div class="flex items-center gap-4 font-mono text-sm">
          <span class="text-muted-foreground w-10">毫秒</span>
          <span class="select-all">{{ currentTimestamp.milliseconds }}</span>
          <Button variant="ghost" size="sm" class="ml-1" @click="copyToClipboard(String(currentTimestamp.milliseconds))">
            复制
          </Button>
        </div>
      </div>
    </Card>

    <!-- Conversion Panels (side by side) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Timestamp to Date -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">时间戳 → 日期</h2>
        
        <div class="flex flex-col gap-3">
          <div class="flex gap-2">
            <input
              id="timestamp-input"
              v-model="timestampInput"
              type="text"
              placeholder="输入时间戳，例如: 1710912345000"
              class="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="时间戳输入"
              @input="convertTimestampToDate"
            />
            <Select v-model="timestampUnit" @update:model-value="convertTimestampToDate">
              <SelectTrigger class="w-[140px]" aria-label="时间戳单位">
                <SelectValue placeholder="单位" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动检测</SelectItem>
                <SelectItem value="seconds">秒</SelectItem>
                <SelectItem value="milliseconds">毫秒</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">时区:</span>
            <Select v-model="timezoneForTimestamp" @update:model-value="convertTimestampToDate">
              <SelectTrigger class="flex-1" aria-label="时间戳转日期时区">
                <SelectValue placeholder="选择时区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="tz in timezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }} ({{ tz.offset }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Fixed height output area -->
          <div class="p-3 rounded-md h-16 flex items-center bg-muted">
            <div v-if="timestampToDateResult?.success" class="w-full flex items-center justify-between font-mono text-sm">
              <span class="select-all">{{ timestampToDateResult.output }}</span>
              <Button variant="ghost" size="sm" class="hover:bg-background" @click="copyToClipboard(timestampToDateResult.output)">
                复制
              </Button>
            </div>
            <div v-else-if="timestampToDateResult?.error" class="w-full text-destructive text-sm flex items-center gap-2" role="alert">
              <span>⚠</span>
              <span>{{ timestampToDateResult.error }}</span>
            </div>
            <span v-else class="w-full text-muted-foreground text-sm">转换结果将显示在这里...</span>
          </div>
        </div>
      </Card>

      <!-- Date to Timestamp -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">日期 → 时间戳</h2>
        
        <div class="flex flex-col gap-3">
          <input
            id="date-input"
            v-model="dateInput"
            type="text"
            placeholder="输入日期，格式: yyyy-MM-dd HH:mm:ss"
            class="px-3 py-2 bg-background border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            :class="dateInputError ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'"
            aria-label="日期输入"
            @input="convertDateToTimestamp"
          />
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">时区:</span>
            <Select v-model="timezoneForDate" @update:model-value="convertDateToTimestamp">
              <SelectTrigger class="flex-1" aria-label="日期转时间戳时区">
                <SelectValue placeholder="选择时区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="tz in timezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }} ({{ tz.offset }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Fixed height output area -->
          <div class="p-3 rounded-md h-16 flex items-center bg-muted">
            <div v-if="dateToTimestampResult" class="w-full flex items-center justify-between font-mono text-sm">
              <span class="select-all">{{ dateToTimestampResult.milliseconds }}</span>
              <Button variant="ghost" size="sm" class="hover:bg-background" @click="copyToClipboard(String(dateToTimestampResult.milliseconds))">
                复制
              </Button>
            </div>
            <span v-else class="w-full text-muted-foreground text-sm">转换结果将显示在这里...</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Batch Conversion -->
    <Card class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-foreground">批量转换</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">时区:</span>
          <Select v-model="timezoneForBatch">
            <SelectTrigger class="w-[180px]" aria-label="批量转换时区">
              <SelectValue placeholder="选择时区" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }} ({{ tz.offset }})
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="batchUnit">
            <SelectTrigger class="w-[120px]" aria-label="批量转换单位">
              <SelectValue placeholder="单位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">自动检测</SelectItem>
              <SelectItem value="seconds">秒</SelectItem>
              <SelectItem value="milliseconds">毫秒</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between h-8">
            <label for="batch-input" class="text-sm text-muted-foreground">输入 (每行一个时间戳)</label>
          </div>
          <textarea
            id="batch-input"
            v-model="batchInput"
            placeholder="1710912345000&#10;1710912346000&#10;1710912347000"
            class="h-32 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between h-8">
            <label for="batch-output" class="text-sm text-muted-foreground">输出</label>
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
            id="batch-output"
            v-model="batchOutput"
            readonly
            placeholder="转换结果将显示在这里..."
            class="h-32 px-3 py-2 bg-muted border border-input rounded-md text-sm font-mono resize-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <div class="flex gap-2 mt-4">
        <Button @click="handleBatchConvert">
          批量转换
        </Button>
        <Button variant="outline" @click="handleBatchClear">
          清空
        </Button>
      </div>
      
      <!-- Fixed height error area -->
      <div
        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm mt-4 h-10"
        :class="batchError ? 'bg-destructive/10 text-destructive' : 'bg-transparent'"
        role="alert"
      >
        <template v-if="batchError">
          <span>⚠</span>
          <span>{{ batchError }}</span>
        </template>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCurrentTimestamps,
  timestampToDateString,
  dateToTimestamp,
  batchConvertTimestamps,
  TIMEZONES,
  type TimestampResult
} from './timestamp'

const toast = inject<(msg: string) => void>('toast')
const timezones = TIMEZONES

// Current timestamp (real-time)
const currentTimestamp = ref({ seconds: 0, milliseconds: 0 })
const currentTimeFormatted = ref('')

function updateCurrentTime() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTimestamp.value = getCurrentTimestamps()
  currentTimeFormatted.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

let updateInterval: ReturnType<typeof setInterval> | null = null

// Timestamp to Date
const timestampInput = ref('')
const timestampUnit = ref<'auto' | 'seconds' | 'milliseconds'>('auto')
const timezoneForTimestamp = ref('Asia/Shanghai')
const timestampToDateResult = ref<TimestampResult | null>(null)

// Date to Timestamp
const dateInput = ref('')
const dateInputError = ref(false)
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
  updateCurrentTime()
  updateInterval = setInterval(updateCurrentTime, 1000)
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
    dateInputError.value = false
    return
  }

  // Validate format: yyyy-MM-dd HH:mm:ss
  const formatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  if (!formatRegex.test(dateInput.value)) {
    dateInputError.value = true
    dateToTimestampResult.value = null
    return
  }

  try {
    const date = new Date(dateInput.value)
    if (isNaN(date.getTime())) {
      dateInputError.value = true
      dateToTimestampResult.value = null
      return
    }

    dateInputError.value = false
    dateToTimestampResult.value = {
      seconds: dateToTimestamp(date, 'seconds'),
      milliseconds: dateToTimestamp(date, 'milliseconds')
    }
  } catch {
    dateInputError.value = true
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
