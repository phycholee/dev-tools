<template>
  <div
    class="relative flex flex-col h-full bg-card overflow-hidden"
    :class="roundedClass"
  >
    <!-- Content area -->
    <div class="flex-1 relative overflow-hidden pt-4">
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
        <!-- Error state with context snippet -->
        <template v-if="isError && errorSnippet">
          <!-- Error message banner -->
          <div class="p-3 mx-3 mt-3 bg-destructive/10 border-l-2 border-destructive rounded-r text-sm">
            <div class="flex items-center gap-2 text-destructive font-medium">
              <span>⚠</span>
              <span>{{ modelValue }}</span>
            </div>
            <div v-if="errorLine" class="text-xs text-destructive/70 mt-1">
              第 {{ errorLine }} 行，第 {{ errorColumn || 1 }} 列
            </div>
          </div>
          <!-- Error context snippet -->
          <div class="mt-2">
            <div v-if="errorSnippet.showEllipsisBefore" class="flex">
              <div class="line-number" :style="{ width: gutterWidth }"></div>
              <div class="flex-1 pl-2 text-muted-foreground font-mono text-sm">...</div>
            </div>
            <template v-for="line in errorSnippet.lines" :key="line.num">
              <div
                class="flex select-text"
                :class="{ 'json-error-line': line.isError }"
              >
                <div class="line-number" :style="{ width: gutterWidth }">
                  {{ line.num }}
                </div>
                <pre
                  class="flex-1 pl-2 m-0 bg-transparent font-mono text-sm leading-relaxed whitespace-pre"
                  :class="line.isError ? 'text-destructive' : 'text-muted-foreground'"
                ><code>{{ line.prefix }}{{ line.content }}{{ line.suffix }}</code></pre>
              </div>
              <!-- Column pointer below error line -->
              <div v-if="line.isError && line.pointerOffset >= 0" class="flex">
                <div class="line-number" :style="{ width: gutterWidth }"></div>
                <pre class="flex-1 pl-2 m-0 font-mono text-sm leading-relaxed whitespace-pre"><code class="text-destructive font-bold">{{ ' '.repeat(line.pointerOffset) }}^</code></pre>
              </div>
            </template>
            <div v-if="errorSnippet.showEllipsisAfter" class="flex">
              <div class="line-number" :style="{ width: gutterWidth }"></div>
              <div class="flex-1 pl-2 text-muted-foreground font-mono text-sm">...</div>
            </div>
          </div>
        </template>
        <!-- Fallback: simple error message (no input context) -->
        <div v-else-if="isError" class="p-4 pl-16 text-destructive font-mono text-sm leading-relaxed">
          ⚠ {{ modelValue }}
        </div>
        <!-- Normal output -->
        <div v-else ref="outputRef" tabindex="0" @keydown.ctrl.a.prevent="selectAllOutput" @click="handleOutputClick">
          <!-- Tree view (valid JSON) -->
          <template v-if="treeRoot">
            <div
              v-for="line in allLines"
              :key="line.key"
              class="flex select-text"
            >
              <div class="line-number" :style="{ width: gutterWidth }">
                {{ line.num }}
              </div>
              <pre
                class="flex-1 pl-2 m-0 bg-transparent text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"
              ><code v-html="line.html"></code></pre>
            </div>
          </template>
          <!-- Fallback: plain highlighted lines (non-JSON output) -->
          <template v-else>
            <div
              v-for="line in allLines"
              :key="line.key"
              class="flex select-text"
            >
              <div class="line-number" :style="{ width: gutterWidth }">
                {{ line.num }}
              </div>
              <pre class="flex-1 pl-2 m-0 bg-transparent text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"><code v-html="line.html"></code></pre>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { highlightJson, parseJsonTree, type JsonNode } from './json'

const props = withDefaults(defineProps<{
  modelValue: string
  mode?: 'input' | 'output'
  placeholder?: string
  rounded?: 'all' | 'left' | 'right' | 'none'
  isError?: boolean
  indent?: number
  errorInput?: string
  errorLine?: number
  errorColumn?: number
}>(), {
  mode: 'input',
  placeholder: 'Paste JSON here...',
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
    backgroundColor: 'var(--color-selection)'
  },
  '.cm-content ::selection': {
    backgroundColor: 'var(--color-selection)',
    color: 'var(--color-selection-foreground)'
  },
  '.cm-line ::selection': {
    backgroundColor: 'var(--color-selection)',
    color: 'var(--color-selection-foreground)'
  },
  '.cm-gutters': {
    backgroundColor: 'color-mix(in srgb, var(--color-muted) 20%, transparent)',
    color: 'color-mix(in srgb, var(--color-muted-foreground) 50%, transparent)',
    border: 'none',
    minWidth: '48px'
  },
  '.cm-gutter': {
    width: '100%'
  },
  '.cm-gutter.cm-lineNumbers': {
    width: '100%'
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
    backgroundColor: 'color-mix(in srgb, var(--color-muted) 80%, transparent)'
  },
  '.cm-foldGutter': {
    display: 'none'
  }
}, { dark: false })

// CodeMirror extensions
const extensions = computed(() => [
  customTheme,
  EditorView.lineWrapping,
  Prec.highest(keymap.of([
    { key: 'Mod-f', run: () => true }
  ])),
  EditorView.contentAttributes.of({
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    'aria-label': 'Code editor'
  })
])

const outputRef = ref<HTMLDivElement>()

// ─── HTML Helpers (standalone, reused for on-demand rendering) ────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function valueHtml(value: unknown, type: JsonNode['type']): string {
  switch (type) {
    case 'string': {
      const escaped = (value as string)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      return `<span class="json-string">"${escapeHtml(escaped)}"</span>`
    }
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

function toggleBtnHtml(key: string, collapsed: boolean): string {
  const cls = collapsed ? 'json-toggle json-toggle-expand' : 'json-toggle json-toggle-collapse'
  const label = collapsed ? '+' : '-'
  return `<span class="${cls}" data-key="${key}">${label}</span>`
}

// ─── Tree View ──────────────────────────────────────────────────────────────
const collapsedState = reactive(new Map<string, boolean>())

const treeRoot = computed(() => {
  if (!props.modelValue) return null
  const trimmed = props.modelValue.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null
  // Only use tree view for multi-line JSON (single-line has no meaningful collapsible structure)
  if (!trimmed.includes('\n')) return null
  return parseJsonTree(props.modelValue)
})

const isTreeMode = computed(() => treeRoot.value !== null)

// Lightweight line descriptor — no HTML strings
interface TreeLine {
  num: number
  key: string
  depth: number
  nodeKey?: string
  nodeValue?: unknown
  nodeType?: JsonNode['type']
  isContainer: boolean
  hasChildren: boolean
  isCollapsed: boolean
  comma: boolean
  bracket?: string
  summary?: string
}

// Phase 1: Walk tree → lightweight descriptors only (fast, no string ops)
const treeFlatLines = computed<TreeLine[]>(() => {
  const root = treeRoot.value
  if (!root) return []
  const lines: TreeLine[] = []

  function visit(node: JsonNode, depth: number, isLast: boolean = true) {
    const isContainer = node.type === 'object' || node.type === 'array'
    const hasChildren = isContainer && node.children && node.children.length > 0
    const nodeKey = String(node.startLine)
    const isCollapsed = hasChildren && collapsedState.get(nodeKey) === true
    const comma = !isLast

    if (!isContainer) {
      lines.push({
        num: node.startLine, key: nodeKey, depth,
        nodeKey: node.key, nodeValue: node.value, nodeType: node.type,
        isContainer: false, hasChildren: false, isCollapsed: false, comma
      })
      return
    }

    if (!hasChildren) {
      lines.push({
        num: node.startLine, key: nodeKey, depth,
        nodeKey: node.key,
        bracket: node.type === 'object' ? '{}' : '[]',
        isContainer: true, hasChildren: false, isCollapsed: false, comma
      })
      return
    }

    const openBracket = node.type === 'object' ? '{' : '['

    if (isCollapsed) {
      lines.push({
        num: node.startLine, key: nodeKey, depth,
        nodeKey: node.key, bracket: openBracket,
        isContainer: true, hasChildren: true, isCollapsed: true, comma,
        summary: node.type === 'object'
          ? 'Object{...}'
          : `Array[${node.children!.length}]`
      })
      return
    }

    // Opening line
    lines.push({
      num: node.startLine, key: nodeKey, depth,
      nodeKey: node.key, bracket: openBracket,
      isContainer: true, hasChildren: true, isCollapsed: false, comma: false
    })

    const children = node.children!
    for (let i = 0; i < children.length; i++) {
      visit(children[i], depth + 1, i === children.length - 1)
    }

    const closeBracket = node.type === 'object' ? '}' : ']'
    lines.push({
      num: node.endLine, key: String(node.endLine) + '_close', depth,
      bracket: closeBracket,
      isContainer: true, hasChildren: false, isCollapsed: false, comma
    })
  }

  visit(root, 0)
  return lines
})

// Phase 2: Generate HTML only for visible lines (called per visible line)
function treeLineToHtml(line: TreeLine): string {
  const indent = indentStr(line.depth)

  // Close bracket / empty container
  if (line.bracket && !line.hasChildren) {
    return indent + keyHtml(line.nodeKey) + line.bracket + (line.comma ? ',' : '')
  }

  // Collapsed container
  if (line.isCollapsed) {
    return indent + keyHtml(line.nodeKey) + line.bracket!
      + toggleBtnHtml(line.key, true) + ' '
      + `<span class="text-muted-foreground">${line.summary}</span>`
      + (line.comma ? ',' : '')
  }

  // Opening bracket
  if (line.bracket) {
    return indent + keyHtml(line.nodeKey) + line.bracket + toggleBtnHtml(line.key, false)
  }

  // Leaf value
  return indent + keyHtml(line.nodeKey) + valueHtml(line.nodeValue, line.nodeType!) + (line.comma ? ',' : '')
}

// ─── Fallback lines (non-tree, pre-highlighted) ──────────────────────────────

const fallbackLines = computed<string[]>(() => {
  if (!props.modelValue) return []
  return highlightJson(props.modelValue).split('\n')
})

// ─── Error context snippet ────────────────────────────────────────────────────

const SNIPPET_LINE_CTX = 2
const SNIPPET_COL_RADIUS = 30

interface ErrorSnippetLine {
  num: number
  content: string
  isError: boolean
  prefix: string
  suffix: string
  pointerOffset: number
}

const errorSnippet = computed(() => {
  if (!props.errorInput || !props.errorLine) return null

  const allLines = props.errorInput.split('\n')
  const errIdx = props.errorLine - 1
  const errCol = props.errorColumn || 1

  const startIdx = Math.max(0, errIdx - SNIPPET_LINE_CTX)
  const endIdx = Math.min(allLines.length - 1, errIdx + SNIPPET_LINE_CTX)

  const lines: ErrorSnippetLine[] = []

  for (let i = startIdx; i <= endIdx; i++) {
    const isError = i === errIdx
    const raw = allLines[i]

    if (isError && raw.length > SNIPPET_COL_RADIUS * 2) {
      const sliceStart = Math.max(0, errCol - SNIPPET_COL_RADIUS)
      const sliceEnd = Math.min(raw.length, errCol + SNIPPET_COL_RADIUS)
      const hasPrefix = sliceStart > 0
      const hasSuffix = sliceEnd < raw.length
      lines.push({
        num: i + 1,
        content: raw.slice(sliceStart, sliceEnd),
        isError: true,
        prefix: hasPrefix ? '...' : '',
        suffix: hasSuffix ? '...' : '',
        pointerOffset: (hasPrefix ? 3 : 0) + (errCol - 1 - sliceStart)
      })
    } else {
      const truncated = raw.length > 100
      lines.push({
        num: i + 1,
        content: truncated ? raw.slice(0, 97) : raw,
        isError,
        prefix: '',
        suffix: truncated ? '...' : '',
        pointerOffset: isError ? errCol - 1 : 0
      })
    }
  }

  return {
    lines,
    showEllipsisBefore: startIdx > 0,
    showEllipsisAfter: endIdx < allLines.length - 1
  }
})

// ─── Visible Lines (HTML generated on-demand for ~30 lines only) ─────────────

interface VisibleLine {
  num: number
  key: string
  html: string
}

const totalLineCount = computed(() =>
  isTreeMode.value ? treeFlatLines.value.length : fallbackLines.value.length
)

const allLines = computed<VisibleLine[]>(() => {
  if (isTreeMode.value) {
    return treeFlatLines.value.map(line => ({
      num: line.num,
      key: line.key,
      html: treeLineToHtml(line)
    }))
  }

  return fallbackLines.value.map((html, i) => ({
    num: i + 1,
    key: String(i),
    html
  }))
})

// ─── Collapse / Expand ───────────────────────────────────────────────────────

function toggleCollapse(key: string) {
  const current = collapsedState.get(key)
  if (current) {
    collapsedState.delete(key)
  } else {
    collapsedState.set(key, true)
  }
}

function handleOutputClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.classList.contains('json-toggle')) {
    e.stopPropagation()
    const key = target.getAttribute('data-key')
    if (key) toggleCollapse(key)
  }
}

// ─── Select All ──────────────────────────────────────────────────────────────

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

// ─── Gutter Width ────────────────────────────────────────────────────────────

const gutterWidth = computed(() => {
  let maxLine: number
  if (props.isError && props.errorInput) {
    maxLine = props.errorInput.split('\n').length
  } else {
    maxLine = totalLineCount.value
  }
  if (maxLine === 0) return '48px'
  const digits = maxLine.toString().length
  return `calc(${digits}ch + 2rem)`
})
</script>

<style>
/* Line number - match CodeMirror gutter style */
.line-number {
  flex-shrink: 0;
  text-align: right;
  padding-left: 8px;
  padding-right: 8px;
  min-width: 48px;
  color: color-mix(in srgb, var(--color-muted-foreground) 50%, transparent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.625;
  user-select: none;
  background-color: color-mix(in srgb, var(--color-muted) 20%, transparent);
}

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
  background-color: var(--color-selection) !important;
}

.cm-editor .cm-content ::selection,
.cm-editor .cm-line ::selection {
  background-color: var(--color-selection) !important;
  color: var(--color-selection-foreground) !important;
}

.cm-editor .cm-content *::selection {
  background-color: var(--color-selection) !important;
  color: var(--color-selection-foreground) !important;
}

/* Line number right alignment */
.cm-editor .cm-gutter {
  width: 100% !important;
}

.cm-editor .cm-gutter.cm-lineNumbers {
  width: 100% !important;
}

.cm-editor .cm-gutter.cm-lineNumbers .cm-gutterElement {
  text-align: right !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

/* Hide fold gutter - it overlaps content area and causes visual artifacts */
.cm-editor .cm-foldGutter {
  display: none !important;
  width: 0 !important;
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
  color: var(--color-info);
  border: 2px solid var(--color-info);
}
.json-toggle-expand:hover {
  background: color-mix(in srgb, var(--color-info) 22%, transparent);
}
.json-toggle-collapse {
  color: var(--color-destructive);
  border: 2px solid var(--color-destructive);
}
.json-toggle-collapse:hover {
  background: color-mix(in srgb, var(--color-destructive) 22%, transparent);
}

/* Error line highlight */
.json-error-line {
  background-color: color-mix(in srgb, var(--color-destructive) 8%, transparent);
}

.json-error-line .line-number {
  color: var(--color-destructive);
  background-color: color-mix(in srgb, var(--color-destructive) 15%, var(--color-muted) 20%);
}
</style>
