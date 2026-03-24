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
        <!-- Normal output -->
        <div v-else ref="outputRef" tabindex="0" @keydown.ctrl.a.prevent="selectAllOutput">
          <!-- Tree view (valid JSON) -->
          <template v-if="treeRoot">
            <div 
              v-for="line in renderLines" 
              :key="line.key"
              class="flex select-text"
            >
              <div class="w-12 flex-shrink-0 text-right pr-2 pl-2 text-muted-foreground/50 font-mono text-sm leading-relaxed select-none bg-muted/20">
                {{ line.lineNumber }}
              </div>
              <pre
                class="flex-1 pl-2 m-0 bg-transparent text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"
                @click="handleOutputClick"
              ><code v-html="line.html"></code></pre>
            </div>
          </template>
          <!-- Fallback: plain highlighted lines (non-JSON output) -->
          <template v-else>
            <div 
              v-for="(line, index) in highlightedLines" 
              :key="index"
              class="flex select-text"
            >
              <div class="w-12 flex-shrink-0 text-right pr-2 pl-2 text-muted-foreground/50 font-mono text-sm leading-relaxed select-none bg-muted/20">
                {{ index + 1 }}
              </div>
              <pre class="flex-1 pl-2 m-0 bg-transparent text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"><code v-html="line"></code></pre>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
import { highlightJson, parseJsonTree, type JsonNode } from './json'

const props = withDefaults(defineProps<{
  modelValue: string
  mode?: 'input' | 'output'
  label?: string
  placeholder?: string
  status?: string
  statusType?: 'success' | 'error' | 'info'
  rounded?: 'all' | 'left' | 'right' | 'none'
  isError?: boolean
  indent?: number
}>(), {
  mode: 'input',
  label: 'Input',
  placeholder: 'Paste JSON here...',
  statusType: 'info',
  rounded: 'all',
  isError: false,
  indent: 2
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

// ─── Tree View ──────────────────────────────────────────────────────────────
// Collapse state: key = "lineNumber", value = true if collapsed
const collapsedState = reactive(new Map<string, boolean>())

// Parse JSON into tree (only for objects/arrays, not primitives)
const treeRoot = computed(() => {
  if (!props.modelValue) return null
  const trimmed = props.modelValue.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null
  return parseJsonTree(props.modelValue)
})

interface RenderLine {
  lineNumber: number
  html: string
  key: string
}

// Flatten tree into visible render lines
const renderLines = computed<RenderLine[]>(() => {
  const root = treeRoot.value
  if (!root) return []

  const lines: RenderLine[] = []

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function valueHtml(value: unknown, type: JsonNode['type']): string {
    switch (type) {
      case 'string': return `<span class="json-string">"${escapeHtml(value as string)}"</span>`
      case 'number': return `<span class="json-number">${value}</span>`
      case 'boolean': return `<span class="json-boolean">${value}</span>`
      case 'null': return '<span class="json-null">null</span>'
      default: return ''
    }
  }

  function keyHtml(key: string | undefined): string {
    if (!key) return ''
    return `<span class="json-key">"${escapeHtml(key)}"</span>: `
  }

  function indentStr(depth: number): string {
    return ' '.repeat(props.indent).repeat(depth)
  }

  function toggleBtn(key: string, collapsed: boolean): string {
    const cls = collapsed ? 'json-toggle json-toggle-expand' : 'json-toggle json-toggle-collapse'
    const label = collapsed ? '+' : '-'
    return `<span class="${cls}" data-key="${key}">${label}</span>`
  }

  function visit(node: JsonNode, depth: number, isLast: boolean = true) {
    const isContainer = node.type === 'object' || node.type === 'array'
    const hasChildren = isContainer && node.children && node.children.length > 0
    const nodeKey = String(node.startLine)
    const isCollapsed = hasChildren && collapsedState.get(nodeKey) === true
    const comma = isLast ? '' : ','

    if (!isContainer) {
      lines.push({
        lineNumber: node.startLine,
        html: indentStr(depth) + keyHtml(node.key) + valueHtml(node.value, node.type) + comma,
        key: nodeKey,
      })
      return
    }

    // Empty container: {} or [] on one line
    if (!hasChildren) {
      const bracket = node.type === 'object' ? '{}' : '[]'
      lines.push({
        lineNumber: node.startLine,
        html: indentStr(depth) + keyHtml(node.key) + bracket + comma,
        key: nodeKey,
      })
      return
    }

    const openBracket = node.type === 'object' ? '{' : '['

    // Collapsed container: show summary after bracket
    if (isCollapsed) {
      const summary = node.type === 'object'
        ? 'Object{...}'
        : `Array[${node.children!.length}]`
      lines.push({
        lineNumber: node.startLine,
        html: indentStr(depth) + keyHtml(node.key)
          + openBracket + toggleBtn(nodeKey, true) + ' '
          + `<span class="text-muted-foreground">${summary}</span>` + comma,
        key: nodeKey,
      })
      return
    }

    // Expanded container: opening line with toggle
    lines.push({
      lineNumber: node.startLine,
      html: indentStr(depth) + keyHtml(node.key) + openBracket + toggleBtn(nodeKey, false),
      key: nodeKey,
    })

    const children = node.children!
    for (let i = 0; i < children.length; i++) {
      visit(children[i], depth + 1, i === children.length - 1)
    }

    const closeBracket = node.type === 'object' ? '}' : ']'
    lines.push({
      lineNumber: node.endLine,
      html: indentStr(depth) + closeBracket + comma,
      key: String(node.endLine) + '_close',
    })
  }

  visit(root, 0)
  return lines
})

function toggleCollapse(key: string) {
  const current = collapsedState.get(key)
  if (current) {
    collapsedState.delete(key)
  } else {
    collapsedState.set(key, true)
  }
}

// Event delegation for inline toggle buttons rendered via v-html
function handleOutputClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.classList.contains('json-toggle')) {
    e.stopPropagation()
    const key = target.getAttribute('data-key')
    if (key) toggleCollapse(key)
  }
}

// Fallback: plain text lines when no tree (shouldn't happen for valid JSON)
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

/* JSON tree toggle button (rendered via v-html) */
.json-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.9rem;
  height: 0.9rem;
  margin: 0 1px;
  padding: 0;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  -webkit-text-stroke: 0.4px;
}
.json-toggle-expand {
  color: #00cfe8;
  border: 2px solid #00cfe8;
}
.json-toggle-expand:hover {
  background: hsl(180 70% 40% / 0.22);
}
.json-toggle-collapse {
  color: #ea5455;
  border: 2px solid #ea5455;
}
.json-toggle-collapse:hover {
  background: hsl(0 70% 55% / 0.22);
}
</style>
