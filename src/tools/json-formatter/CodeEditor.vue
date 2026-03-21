<template>
  <div class="relative flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden">
    <!-- Header bar -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
      <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {{ label }}
      </span>
      <Badge v-if="status" :variant="statusVariant" class="text-xs">
        {{ status }}
      </Badge>
    </div>

    <!-- Content area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Input mode: textarea -->
      <textarea
        v-if="mode === 'input'"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        class="w-full h-full p-4 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none placeholder:text-muted-foreground/50"
        spellcheck="false"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />

      <!-- Output mode: syntax highlighted -->
      <pre
        v-else
        class="w-full h-full p-4 m-0 bg-transparent text-foreground font-mono text-sm leading-relaxed overflow-auto"
      ><code v-html="highlightedContent"></code></pre>
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
}>(), {
  mode: 'input',
  label: 'Input',
  placeholder: 'Paste JSON here...',
  statusType: 'info'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement>()

const statusVariant = computed(() => {
  if (props.statusType === 'success') return 'default'
  if (props.statusType === 'error') return 'destructive'
  return 'secondary'
})

const highlightedContent = computed(() => {
  if (!props.modelValue) return ''
  return highlightJson(props.modelValue)
})
</script>
