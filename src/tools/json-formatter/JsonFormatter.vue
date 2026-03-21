<template>
  <div class="flex flex-col h-[calc(100vh-120px)] p-4 gap-4 w-full max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-3xl">{ }</span>
        <div>
          <h1 class="text-xl font-bold text-foreground">JSON格式化</h1>
          <p class="text-sm text-muted-foreground">JSON美化、压缩、转义工具</p>
        </div>
      </div>
    </div>

    <!-- Editor panels -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
      <!-- Input -->
      <CodeEditor
        v-model="input"
        mode="input"
        label="输入"
        placeholder='粘贴 JSON 内容，例如: {"name": "DevTools"}'
        :status="error ? '语法错误' : input ? '已输入' : undefined"
        :status-type="error ? 'error' : input ? 'success' : 'info'"
      />

      <!-- Output -->
      <CodeEditor
        v-model="output"
        mode="output"
        label="输出"
        :status="error || (output ? '格式化完成' : undefined)"
        :status-type="error ? 'error' : 'success'"
      />
    </div>

    <!-- Error display -->
    <div
      v-if="error"
      class="flex items-center gap-2 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm"
    >
      <span>⚠</span>
      <span>{{ error }}</span>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-wrap items-center gap-3">
      <Button @click="handleFormat" variant="default">
        格式化
      </Button>
      <Button @click="handleCompress" variant="secondary">
        压缩
      </Button>
      <Button @click="handleEscape" variant="secondary">
        转义
      </Button>
      <Button @click="handleUnescape" variant="secondary">
        消除转义
      </Button>

      <div class="w-px h-6 bg-border mx-2" />

      <Button @click="handleCopy" variant="outline" :disabled="!output">
        复制结果
      </Button>
      <Button @click="handleClear" variant="ghost">
        清空
      </Button>

      <div class="w-px h-6 bg-border mx-2" />

      <!-- Indent selector -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">缩进:</span>
        <Button
          @click="indent = 2"
          :variant="indent === 2 ? 'default' : 'outline'"
          size="sm"
        >
          2空格
        </Button>
        <Button
          @click="indent = 4"
          :variant="indent === 4 ? 'default' : 'outline'"
          size="sm"
        >
          4空格
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import CodeEditor from './CodeEditor.vue'
import { formatJson, compressJson, escapeJson, unescapeJson } from './json'

const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref(2)

function handleFormat() {
  const result = formatJson(input.value, indent.value)
  if (result.success) {
    output.value = result.output
    error.value = ''
  } else {
    error.value = result.error || 'Unknown error'
    output.value = ''
  }
}

function handleCompress() {
  const result = compressJson(input.value)
  if (result.success) {
    output.value = result.output
    error.value = ''
  } else {
    error.value = result.error || 'Unknown error'
    output.value = ''
  }
}

function handleEscape() {
  const result = escapeJson(input.value)
  if (result.success) {
    output.value = result.output
    error.value = ''
  } else {
    error.value = result.error || 'Unknown error'
    output.value = ''
  }
}

function handleUnescape() {
  const result = unescapeJson(input.value)
  if (result.success) {
    output.value = result.output
    error.value = ''
  } else {
    error.value = result.error || 'Unknown error'
    output.value = ''
  }
}

async function handleCopy() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    toast.success('已复制到剪贴板')
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = output.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    toast.success('已复制到剪贴板')
  }
}

function handleClear() {
  input.value = ''
  output.value = ''
  error.value = ''
}

// Re-format output when indent changes
watch(indent, () => {
  if (input.value.trim()) {
    handleFormat()
  }
})

// Auto-format on input change (debounced)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(input, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    output.value = ''
    error.value = ''
    return
  }
  debounceTimer = setTimeout(() => {
    const result = formatJson(val, indent.value)
    if (result.success) {
      output.value = result.output
      error.value = ''
    } else {
      // Don't show error while typing - only on explicit action
      error.value = ''
    }
  }, 500)
})
</script>
