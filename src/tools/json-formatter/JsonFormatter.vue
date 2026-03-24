<template>
  <div 
    ref="containerRef"
    class="flex flex-col p-4 gap-4 w-full"
    :class="isFullscreen ? 'fixed inset-0 z-50 bg-background max-w-none h-screen' : 'h-[calc(100vh-120px)] max-w-6xl mx-auto'"
  >
    <!-- Header -->
    <div v-if="!isFullscreen" class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-3xl">{ }</span>
        <div>
          <h1 class="text-xl font-bold text-foreground">JSON格式化</h1>
          <p class="text-sm text-muted-foreground">JSON美化、压缩、转义工具</p>
        </div>
      </div>
    </div>

    <!-- Editor panels with resizable divider -->
    <div ref="panelsRef" class="flex-1 flex min-h-0">
      <!-- Input -->
      <div :style="{ width: inputWidth + '%' }" class="min-w-[200px]">
        <CodeEditor
          v-model="input"
          mode="input"
          label="输入"
          placeholder='粘贴 JSON 内容，例如: {"name": "DevTools"}'
          rounded="left"
        />
      </div>

      <!-- Resizable divider -->
      <div
        class="w-1 flex-shrink-0 cursor-col-resize hover:bg-accent/50 transition-colors"
        @mousedown="startResize"
      />

      <!-- Output -->
      <div :style="{ width: (100 - inputWidth) + '%' }" class="min-w-[200px]">
        <CodeEditor
          v-model="output"
          mode="output"
          label="输出"
          :is-error="hasError"
          :indent="indent"
          rounded="right"
        >
          <template #actions>
            <Button
              variant="ghost"
              size="icon-sm"
              @click="toggleFullscreen"
              class="h-6 w-6"
              :aria-label="isFullscreen ? '退出全屏' : '全屏'"
            >
              <Minimize2 v-if="isFullscreen" class="h-3.5 w-3.5" />
              <Maximize2 v-else class="h-3.5 w-3.5" />
            </Button>
          </template>
        </CodeEditor>
      </div>
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

      <Button @click="handleCopy" variant="outline" :disabled="!output || hasError">
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
import { ref, watch, inject, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import CodeEditor from './CodeEditor.vue'
import { formatJson, compressJson, escapeJson, unescapeJson } from './json'

const input = ref('')
const output = ref('')
const hasError = ref(false)
const indent = ref(2)
const toast = inject<(msg: string) => void>('toast')

// Fullscreen
const containerRef = ref<HTMLElement>()
const isFullscreen = ref(false)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

// Resizable panels
const panelsRef = ref<HTMLElement>()
const inputWidth = ref(40) // 4:6 ratio = 40%:60%
let isResizing = false

function startResize() {
  isResizing = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing || !panelsRef.value) return
    
    const rect = panelsRef.value.getBoundingClientRect()
    const percentage = ((e.clientX - rect.left) / rect.width) * 100
    
    // Clamp between 20% and 80%
    inputWidth.value = Math.max(20, Math.min(80, percentage))
  }
  
  const onMouseUp = () => {
    isResizing = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

onUnmounted(() => {
  // Cleanup if component is destroyed while resizing
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

function handleFormat() {
  const result = formatJson(input.value, indent.value)
  output.value = result.output
  hasError.value = !result.success
}

function handleCompress() {
  const result = compressJson(input.value)
  output.value = result.output
  hasError.value = !result.success
}

function handleEscape() {
  const result = escapeJson(input.value)
  output.value = result.output
  hasError.value = !result.success
}

function handleUnescape() {
  const result = unescapeJson(input.value)
  output.value = result.output
  hasError.value = !result.success
}

async function handleCopy() {
  if (!output.value || hasError.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    toast?.('已复制到剪贴板')
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = output.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    toast?.('已复制到剪贴板')
  }
}

function handleClear() {
  input.value = ''
  output.value = ''
  hasError.value = false
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
    hasError.value = false
    return
  }
  debounceTimer = setTimeout(() => {
    const result = formatJson(val, indent.value)
    output.value = result.output
    hasError.value = !result.success
  }, 500)
})
</script>
