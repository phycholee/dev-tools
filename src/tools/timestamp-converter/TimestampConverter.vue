<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-[1200px] mx-auto">
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

    <!-- Conversion Panels (side by side) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Timestamp to Date -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">时间戳 → 日期</h2>
        
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

          <!-- Fixed height output area -->
          <div
            class="p-3 rounded-md h-14 flex items-center"
            :class="timestampToDateResult?.success ? 'bg-muted' : timestampToDateResult?.error ? 'bg-destructive/10' : 'bg-muted/50'"
          >
            <div v-if="timestampToDateResult?.success" class="font-mono text-sm select-all">
              {{ timestampToDateResult.output }}
            </div>
            <div v-else-if="timestampToDateResult?.error" class="text-destructive text-sm flex items-center gap-2">
              <span>⚠</span>
              <span>{{ timestampToDateResult.error }}</span>
            </div>
            <span v-else class="text-muted-foreground text-sm">结果将显示在这里...</span>
          </div>
        </div>
      </Card>

      <!-- Date to Timestamp -->
      <Card class="p-4">
        <h2 class="text-lg font-semibold text-foreground mb-4">日期 → 时间戳</h2>
        
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

          <!-- Fixed height output area -->
          <div class="p-3 bg-muted rounded-md h-20">
            <div v-if="dateToTimestampResult" class="flex flex-col gap-2 font-mono text-sm h-full">
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
            <div v-else class="h-full flex items-center text-muted-foreground text-sm">
              选择日期时间后显示时间戳...
            </div>
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
