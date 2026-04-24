<template>
  <div
    class="flex flex-col w-full"
    style="height: calc(100vh - var(--header-height) - 1.5rem)"
  >
    <!-- Header -->
    <div class="w-full px-4 pt-4 mx-auto transition-all duration-200" :class="isFullscreen ? '' : 'max-w-6xl'">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Braces class="w-8 h-8 text-tool-json" />
          <div>
            <h1 class="text-xl font-bold text-foreground">JSON格式化</h1>
            <p class="text-sm text-muted-foreground">JSON美化、压缩、转义工具</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <Button @click="handleFormat" variant="default" size="sm" title="格式化 JSON (自动执行)">
            格式化
          </Button>
          <Button @click="handleCompress" variant="secondary" size="sm" title="压缩为单行">
            压缩
          </Button>
          <Button @click="handleEscape" variant="secondary" size="sm" title="转义特殊字符">
            转义
          </Button>
          <Button @click="handleUnescape" variant="secondary" size="sm" title="消除转义字符">
            消除转义
          </Button>

          <div class="w-px h-5 bg-border mx-1" />

          <Button @click="handleCopy" variant="outline" size="sm" :disabled="!output || hasError" title="复制结果">
            复制
          </Button>
          <Button @click="handleClear" variant="ghost" size="sm" title="清空输入和输出">
            清空
          </Button>

          <div class="w-px h-5 bg-border mx-1" />

          <!-- Indent selector -->
          <div class="flex items-center gap-1">
            <span class="text-xs text-muted-foreground">缩进:</span>
            <Button
              @click="indent = 2"
              :variant="indent === 2 ? 'default' : 'outline'"
              size="sm"
              class="h-7 px-2 text-xs"
              title="2空格缩进"
            >
              2
            </Button>
            <Button
              @click="indent = 4"
              :variant="indent === 4 ? 'default' : 'outline'"
              size="sm"
              class="h-7 px-2 text-xs"
              title="4空格缩进"
            >
              4
            </Button>
          </div>
        </div>
      </div>

      <!-- Help tip -->
      <div class="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50">
        <div class="flex items-start gap-2">
          <span class="text-muted-foreground text-sm">💡</span>
          <div class="text-sm text-muted-foreground">
            <strong class="text-foreground">使用提示：</strong>
            粘贴 JSON 到左侧输入框，工具会自动格式化并显示在右侧。支持美化、压缩、转义和消除转义操作。
            <span class="text-xs opacity-75 ml-2">输入时自动格式化，无需手动点击</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor panels -->
    <div
      ref="panelsRef"
      class="flex-1 flex flex-col md:flex-row min-h-0 pb-2 pt-2 mx-auto transition-all duration-200"
      :class="isFullscreen ? 'w-full px-4' : 'max-w-6xl w-full px-4'"
    >
      <!-- Input -->
      <div :style="{ width: isMobile ? undefined : inputWidth + '%' }" class="min-w-0 md:min-w-[200px] min-h-[200px] md:min-h-0">
        <CodeEditor
          v-model="input"
          mode="input"
          placeholder='输入 JSON 内容，例如: {"name": "DevTools"}'
          :rounded="isMobile ? 'all' : 'left'"
        />
      </div>

      <!-- Resizable divider - hidden on mobile -->
      <div
        v-if="!isMobile"
        role="separator"
        aria-orientation="vertical"
        aria-valuenow="50"
        aria-label="调整面板宽度"
        tabindex="0"
        class="w-1 flex-shrink-0 cursor-col-resize hover:bg-accent/50 transition-colors focus:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
        @mousedown="startResize"
        @keydown="handleDividerKeydown"
      />

      <!-- Output -->
      <div :style="{ width: isMobile ? undefined : (100 - inputWidth) + '%' }" class="min-w-0 md:min-w-[200px] min-h-[200px] md:min-h-0">
        <CodeEditor
          v-model="output"
          mode="output"
          :is-error="hasError"
          :error-input="hasError ? input : undefined"
          :error-line="errorLine"
          :error-column="errorColumn"
          :indent="indent"
          :rounded="isMobile ? 'all' : 'right'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, onUnmounted, onMounted } from 'vue'
import type { Ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Braces } from 'lucide-vue-next'
import CodeEditor from './CodeEditor.vue'
import { formatJson, compressJson, escapeJson, unescapeJson } from './json'
import { useClipboard } from '@/composables/useClipboard'

const input = ref('')
const output = ref('')
const hasError = ref(false)
const errorLine = ref<number | undefined>()
const errorColumn = ref<number | undefined>()
const indent = ref(2)
const { copyToClipboard } = useClipboard()
const isFullscreen = inject<Ref<boolean>>('isFullscreen')!

// Mobile detection for responsive layout
const isMobile = ref(false)
let mql: MediaQueryList | null = null

onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)')
  isMobile.value = mql.matches
  const handler = (e: MediaQueryListEvent) => { isMobile.value = e.matches }
  mql.addEventListener('change', handler)
})

onUnmounted(() => {
  if (mql) {
    const handler = (e: MediaQueryListEvent) => { isMobile.value = e.matches }
    mql.removeEventListener('change', handler)
  }
})

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

function handleDividerKeydown(e: KeyboardEvent) {
  const step = 2
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    inputWidth.value = Math.max(20, inputWidth.value - step)
    e.preventDefault()
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    inputWidth.value = Math.min(80, inputWidth.value + step)
    e.preventDefault()
  }
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
  errorLine.value = result.errorLine
  errorColumn.value = result.errorColumn
}

function handleCompress() {
  const result = compressJson(input.value)
  output.value = result.output
  hasError.value = !result.success
  errorLine.value = result.errorLine
  errorColumn.value = result.errorColumn
}

function handleEscape() {
  const result = escapeJson(input.value)
  output.value = result.output
  hasError.value = !result.success
  errorLine.value = result.errorLine
  errorColumn.value = result.errorColumn
}

function handleUnescape() {
  const result = unescapeJson(input.value)
  output.value = result.output
  hasError.value = !result.success
  errorLine.value = result.errorLine
  errorColumn.value = result.errorColumn
}

async function handleCopy() {
  if (!output.value || hasError.value) return
  await copyToClipboard(output.value)
}

function handleClear() {
  input.value = ''
  output.value = ''
  hasError.value = false
  errorLine.value = undefined
  errorColumn.value = undefined
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
    errorLine.value = result.errorLine
    errorColumn.value = result.errorColumn
  }, 500)
})
</script>
