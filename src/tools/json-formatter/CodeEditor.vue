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
      <!-- Input mode: CodeMirror -->
      <div v-if="mode === 'input'" class="h-full">
        <Codemirror
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
          :placeholder="placeholder"
          :extensions="extensions"
          :style="{ height: '100%' }"
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
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
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

defineEmits<{
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

// Custom theme using CSS variables (follows light/dark mode)
const customTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-card)',
    color: 'var(--color-foreground)'
  },
  '.cm-content': {
    caretColor: 'var(--color-foreground)'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-foreground)'
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'hsl(217 91% 60%)'
  },
  '.cm-content ::selection': {
    backgroundColor: 'hsl(217 91% 60%)',
    color: 'white'
  },
  '.cm-line ::selection': {
    backgroundColor: 'hsl(217 91% 60%)',
    color: 'white'
  },
  '.cm-gutters': {
    backgroundColor: 'color-mix(in srgb, var(--color-muted) 20%, transparent)',
    color: 'color-mix(in srgb, var(--color-muted-foreground) 50%, transparent)',
    border: 'none',
    width: '48px',
    minWidth: '48px',
    textAlign: 'right'
  },
  '.cm-gutter': {
    textAlign: 'right'
  },
  '.cm-gutter.cm-lineNumbers': {
    textAlign: 'right'
  },
  '.cm-gutter.cm-lineNumbers .cm-gutterElement': {
    textAlign: 'right',
    paddingLeft: '8px',
    paddingRight: '8px'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)'
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 50%, transparent)'
  },
  '.cm-foldGutter': {
    display: 'none'
  }
}, { dark: false })

// CodeMirror extensions - plain text input, no syntax highlighting
const extensions = computed(() => [
  customTheme,
  EditorView.lineWrapping,
  EditorView.contentAttributes.of({ 
    autocapitalize: 'off', 
    autocomplete: 'off', 
    autocorrect: 'off',
    'aria-label': props.label || 'Code editor'
  })
])

const outputRef = ref<HTMLDivElement>()
const outputContainerRef = ref<HTMLDivElement>()

// Split highlighted content into lines for output
const highlightedLines = computed(() => {
  if (!props.modelValue) return ['']
  const highlighted = highlightJson(props.modelValue)
  return highlighted.split('\n')
})

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

<style>
/* Override CodeMirror styles to match project theme */
.cm-editor {
  height: 100%;
}

.cm-editor .cm-scroller {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.625;
}

.cm-editor.cm-focused {
  outline: none;
}

/* Selection styles - match output box */
.cm-editor .cm-selectionBackground,
.cm-editor.cm-focused .cm-selectionBackground {
  background-color: hsl(214 100% 40%) !important;
}

.cm-editor .cm-content ::selection,
.cm-editor .cm-line ::selection {
  background-color: hsl(214 100% 40%) !important;
  color: white !important;
}

.cm-editor .cm-content *::selection {
  background-color: hsl(214 100% 40%) !important;
  color: white !important;
}

/* Line number right alignment */
.cm-editor .cm-gutters {
  text-align: right !important;
}

.cm-editor .cm-gutter.cm-lineNumbers {
  text-align: right !important;
}

.cm-editor .cm-gutter.cm-lineNumbers .cm-gutterElement {
  text-align: right !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
  min-width: unset !important;
}

/* Improve placeholder contrast */
.cm-editor .cm-content .cm-placeholder {
  color: var(--color-muted-foreground) !important;
  opacity: 0.8;
}
</style>
