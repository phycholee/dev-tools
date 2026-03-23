<template>
  <div 
    class="relative flex flex-col h-full border border-border bg-card overflow-hidden"
    :class="roundedClass"
  >
    <!-- Header bar -->
    <div class="flex items-center justify-between px-4 h-9 border-b border-border/50 bg-muted/30">
      <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {{ label }}
      </span>
      <div class="flex items-center gap-2">
        <Badge v-if="status" :variant="statusVariant" class="text-xs">
          {{ status }}
        </Badge>
        <slot name="actions" />
      </div>
    </div>

    <!-- Content area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Input mode -->
      <div v-if="mode === 'input'" class="h-full relative">
        <!-- Line numbers (scrollable container) -->
        <div 
          ref="lineNumbersRef"
          class="absolute left-0 top-0 bottom-0 w-12 overflow-hidden text-right pr-2 pt-4 text-muted-foreground/50 font-mono text-sm leading-relaxed select-none bg-muted/20 pointer-events-none z-10"
        >
          <div v-for="n in lineCount" :key="n">{{ n }}</div>
        </div>
        <!-- Textarea -->
        <textarea
          ref="textareaRef"
          :value="modelValue"
          :placeholder="placeholder"
          class="absolute inset-0 w-full h-full p-4 pl-14 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none placeholder:text-muted-foreground/50 overflow-auto"
          spellcheck="false"
          @input="handleInput"
          @scroll="syncTextareaScroll"
        />
      </div>

      <!-- Output mode -->
      <div v-else class="h-full overflow-auto" ref="outputContainerRef">
        <!-- Error state -->
        <div v-if="isError" class="p-4 pl-16 text-destructive font-mono text-sm leading-relaxed">
          ⚠ {{ modelValue }}
        </div>
        <!-- Normal output with line numbers -->
        <div v-else ref="outputRef" tabindex="0" @keydown.ctrl.a.prevent="selectAllOutput">
          <div 
            v-for="(line, index) in highlightedLines" 
            :key="index"
            class="flex select-text"
          >
            <!-- Line number -->
            <div class="w-12 flex-shrink-0 text-right pr-2 pl-2 text-muted-foreground/50 font-mono text-sm leading-relaxed select-none bg-muted/20">
              {{ index + 1 }}
            </div>
            <!-- Line content -->
            <pre class="flex-1 pl-2 m-0 bg-transparent text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"><code v-html="line"></code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { highlightJson } from './json'

const props = withDefaults(defineProps<{
  modelValue: string
  mode?: 'input' | 'output'
  label?: string
  placeholder?: string
  status?: string
  statusType?: 'success' | 'error' | 'info'
  rounded?: 'all' | 'left' | 'right' | 'none'
  isError?: boolean
}>(), {
  mode: 'input',
  label: 'Input',
  placeholder: 'Paste JSON here...',
  statusType: 'info',
  rounded: 'all',
  isError: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const roundedClass = computed(() => {
  switch (props.rounded) {
    case 'left': return 'rounded-l-lg'
    case 'right': return 'rounded-r-lg'
    case 'none': return ''
    default: return 'rounded-lg'
  }
})

const textareaRef = ref<HTMLTextAreaElement>()
const outputRef = ref<HTMLDivElement>()
const lineNumbersRef = ref<HTMLDivElement>()
const outputContainerRef = ref<HTMLDivElement>()

// Calculate line count based on actual newlines
const lineCount = computed(() => {
  if (!props.modelValue) return 1
  return props.modelValue.split('\n').length
})

// Split highlighted content into lines for output
const highlightedLines = computed(() => {
  if (!props.modelValue) return ['']
  const highlighted = highlightJson(props.modelValue)
  return highlighted.split('\n')
})

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function syncTextareaScroll() {
  if (textareaRef.value && lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

function selectAllOutput() {
  if (!outputRef.value) return
  const range = document.createRange()
  range.selectNodeContents(outputRef.value)
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

const statusVariant = computed(() => {
  if (props.statusType === 'success') return 'default'
  if (props.statusType === 'error') return 'destructive'
  return 'secondary'
})
</script>
