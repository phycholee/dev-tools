# Phase 2: JSON Formatter Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full JSON Formatter tool with beautify, compress, escape, unescape, syntax validation, syntax highlighting, copy, and clear features.

**Architecture:** Three-layer design: JSON utility functions (pure logic) → CodeEditor component (reusable UI) → JsonFormatter page (tool-specific orchestration). No external dependencies needed - JSON parsing is native, syntax highlighting is custom CSS classes.

**Tech Stack:** Vue 3.x, TypeScript, Tailwind CSS, shadcn-vue (Button, Badge)

---

## File Structure

```
src/tools/json-formatter/
├── json.ts                 # JSON utility functions (pure logic)
├── CodeEditor.vue          # Reusable code input/output component
└── JsonFormatter.vue       # Main tool page (orchestration)
```

---

### Task 1: Create JSON utility functions

**Files:**
- Create: `src/tools/json-formatter/json.ts`

- [ ] **Step 1: Create `json.ts` with all JSON utility functions**

```ts
/**
 * JSON utility functions for formatting, escaping, and validation.
 * All functions are pure - no side effects.
 */

export interface JsonFormatResult {
  success: boolean
  output: string
  error?: string
}

/**
 * Beautify JSON with specified indentation
 */
export function formatJson(input: string, indent: number = 2): JsonFormatResult {
  try {
    const parsed = JSON.parse(input)
    return {
      success: true,
      output: JSON.stringify(parsed, null, indent)
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Compress JSON to single line
 */
export function compressJson(input: string): JsonFormatResult {
  try {
    const parsed = JSON.parse(input)
    return {
      success: true,
      output: JSON.stringify(parsed)
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Escape JSON string (for embedding in code)
 */
export function escapeJson(input: string): JsonFormatResult {
  try {
    // Validate it's valid JSON first
    JSON.parse(input)
    const escaped = input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
    return {
      success: true,
      output: `"${escaped}"`
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Unescape JSON string
 */
export function unescapeJson(input: string): JsonFormatResult {
  try {
    // Remove surrounding quotes if present
    let str = input.trim()
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1)
    }
    const unescaped = str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    
    // Validate the unescaped result is valid JSON
    JSON.parse(unescaped)
    return {
      success: true,
      output: unescaped
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Validate JSON and return error details
 */
export function validateJson(input: string): JsonFormatResult {
  try {
    JSON.parse(input)
    return { success: true, output: 'Valid JSON' }
  } catch (e) {
    const err = e as Error
    return { success: false, output: '', error: err.message }
  }
}

/**
 * Syntax highlight JSON string
 * Returns HTML with span classes for coloring
 */
export function highlightJson(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Keys
    .replace(/"([^"]+)"(\s*:)/g, '<span class="json-key">"$1"</span>$2')
    // String values
    .replace(/:\s*"([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    // Numbers
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    // Booleans
    .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
    // Null
    .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/json-formatter/json.ts
git commit -m "feat(json): add JSON utility functions (format, compress, escape, unescape, highlight)"
```

---

### Task 2: Create CodeEditor component

**Files:**
- Create: `src/tools/json-formatter/CodeEditor.vue`

- [ ] **Step 1: Create CodeEditor component**

A reusable code editor with:
- Textarea for input (editable)
- Pre+code block for output (syntax highlighted)
- Mode prop: 'input' | 'output'
- Placeholder text
- v-model binding

```vue
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
    <div class="flex-1 relative overflow-auto">
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/json-formatter/CodeEditor.vue
git commit -m "feat(json): add CodeEditor component with syntax highlighting"
```

---

### Task 3: Create JsonFormatter page

**Files:**
- Modify: `src/tools/json-formatter/JsonFormatter.vue`

- [ ] **Step 1: Rewrite JsonFormatter.vue with full functionality**

```vue
<template>
  <div class="flex flex-col h-[calc(100vh-120px)] p-6 gap-4 max-w-6xl mx-auto">
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
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = output.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

function handleClear() {
  input.value = ''
  output.value = ''
  error.value = ''
}

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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/json-formatter/JsonFormatter.vue
git commit -m "feat(json): implement full JSON formatter page with all features"
```

---

### Task 4: Add JSON syntax highlight CSS

**Files:**
- Modify: `src/assets/styles/globals.css`

- [ ] **Step 1: Add JSON highlighting color classes to globals.css**

Append to globals.css:

```css
/* JSON syntax highlighting colors */
.json-key {
  color: #9cdcfe;
}

.json-string {
  color: #ce9178;
}

.json-number {
  color: #b5cea8;
}

.json-boolean {
  color: #569cd6;
}

.json-null {
  color: #569cd6;
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/assets/styles/globals.css
git commit -m "feat(json): add JSON syntax highlighting CSS classes"
```

---

### Task 5: Visual verification and cleanup

- [ ] **Step 1: Start dev server and visually test**

```bash
npm run dev
```

Navigate to `http://localhost:5173/json-formatter` and test:
- [ ] Paste valid JSON → click Format → output shows beautified JSON
- [ ] Paste invalid JSON → error message shows
- [ ] Click Compress → output is single-line
- [ ] Click Escape → output is escaped string
- [ ] Click Unescape → output is unescaped JSON
- [ ] Click Copy → clipboard has the output
- [ ] Click Clear → both panels are empty
- [ ] Toggle 2/4 space indent → output changes
- [ ] Syntax highlighting colors are visible

- [ ] **Step 2: Final build verification**

```bash
npm run build
```

- [ ] **Step 3: Update PROJECT_MEMORY.md**

Update Phase 2 status from ⏳ to ✅, add git commits.

- [ ] **Step 4: Create changelog**

```bash
# docs/changelog/2026-03-21-json-formatter.md
```

- [ ] **Step 5: Final commit**

```bash
git add docs/
git commit -m "docs: update changelog and memory for JSON formatter completion"
```

---

## Execution Options

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks

**2. Inline Execution** — Execute tasks in this session using executing-plans

Which approach?
