<template>
  <div class="relative w-full h-full min-h-[200px]">
    <!-- Highlight layer -->
    <div
      ref="highlightRef"
      class="absolute inset-0 p-3 font-mono text-sm whitespace-pre-wrap break-words overflow-auto pointer-events-none rounded-md border border-input bg-muted/30"
      aria-hidden="true"
    >
      <template v-for="(segment, i) in segments" :key="i">
        <mark
          v-if="segment.isMatch"
          class="bg-primary/30 text-foreground rounded-sm"
        >{{ segment.text }}</mark>
        <span v-else>{{ segment.text }}</span>
      </template>
    </div>

    <!-- Input layer - text colored to match highlight layer so it's visible but doesn't create double-text -->
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      class="relative w-full h-full p-3 font-mono text-sm bg-transparent border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground text-foreground/0 caret-foreground"
      aria-label="测试文本"
      @scroll="onScroll"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MatchItem } from './regex'

const props = defineProps<{
  modelValue: string
  matches: MatchItem[]
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const highlightRef = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()

interface Segment {
  text: string
  isMatch: boolean
}

const segments = computed<Segment[]>(() => {
  const text = props.modelValue
  const matches = props.matches

  if (!text) return []
  if (matches.length === 0) return [{ text, isMatch: false }]

  const result: Segment[] = []
  let lastIndex = 0

  for (const match of matches) {
    if (match.index > lastIndex) {
      result.push({ text: text.slice(lastIndex, match.index), isMatch: false })
    }
    result.push({ text: match.value, isMatch: true })
    lastIndex = match.index + match.length
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), isMatch: false })
  }

  return result
})

function syncScroll() {
  if (highlightRef.value && textareaRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
}

let rafId: number | null = null
function onScroll() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    syncScroll()
    rafId = null
  })
}

onMounted(() => {
  syncScroll()
})
</script>
