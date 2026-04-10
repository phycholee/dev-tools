<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Regex class="w-8 h-8 text-tool-regex" />
      <div>
        <h1 class="text-xl font-bold text-foreground">正则表达式测试</h1>
        <p class="text-sm text-muted-foreground">正则匹配、高亮工具</p>
      </div>
    </div>

    <!-- Help tip -->
    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="flex items-start gap-2">
        <span class="text-muted-foreground text-sm">💡</span>
        <div class="text-sm text-muted-foreground">
          <strong class="text-foreground">标志位：</strong>
          <strong>g</strong> 全局匹配 ·
          <strong>i</strong> 忽略大小写 ·
          <strong>m</strong> 多行模式（^$ 匹配行首行尾）·
          <strong>s</strong> 让 . 匹配换行符 ·
          <strong>u</strong> Unicode 模式
        </div>
      </div>
    </div>

    <!-- Pattern Input -->
    <Card class="p-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1 text-muted-foreground">
            <span class="font-mono text-lg">/</span>
          </div>
          <input
            v-model="pattern"
            type="text"
            placeholder="输入正则表达式..."
            class="flex-1 min-w-[200px] px-3 py-2 bg-card border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            :class="!validation.valid ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'"
            aria-label="正则表达式"
            autocomplete="off"
          />
          <div class="flex items-center gap-1 text-muted-foreground">
            <span class="font-mono text-lg">/</span>
          </div>

          <!-- Flags -->
          <div class="flex items-center gap-1">
            <Button
              v-for="flag in availableFlags"
              :key="flag.value"
              @click="toggleFlag(flag.value)"
              :variant="flags.includes(flag.value) ? 'default' : 'outline'"
              size="sm"
              class="w-8 h-8 font-mono"
              :title="flag.description"
              :aria-pressed="flags.includes(flag.value)"
              :aria-label="flag.description"
            >
              {{ flag.label }}
            </Button>
          </div>

          <!-- Templates -->
          <Select v-model="selectedTemplate" @update:model-value="applyTemplate">
            <SelectTrigger class="w-[160px]" aria-label="常用模板">
              <SelectValue placeholder="常用模板" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="t in templates" :key="t.name" :value="t.name">
                {{ t.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Validation error -->
        <div
          v-if="!validation.valid && pattern"
          class="flex items-center gap-2 text-destructive text-sm"
          role="alert"
        >
          <span>⚠</span>
          <span>{{ validation.error }}</span>
        </div>
      </div>
    </Card>

    <!-- Test Text with Highlight -->
    <Card class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-foreground">测试文本</h2>
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <span>匹配数: <strong class="text-foreground">{{ matchResult.matches.length }}</strong></span>
          <span v-if="matchResult.matches[0]?.groups?.length">
            捕获组: <strong class="text-foreground">{{ matchResult.matches[0].groups.length }}</strong>
          </span>
        </div>
      </div>
      <RegexHighlight
        v-model="testText"
        :matches="matchResult.matches"
        placeholder="输入测试文本..."
      />
    </Card>

    <!-- Explanation -->
    <Card v-if="pattern && validation.valid" class="p-4">
      <h2 class="text-sm font-semibold text-foreground mb-3">正则解释</h2>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(part, i) in explanation.parts"
          :key="i"
          class="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
        >
          <code class="font-mono text-primary">{{ part.pattern }}</code>
          <span class="text-muted-foreground">→</span>
          <span>{{ part.description }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Regex } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RegexHighlight from './RegexHighlight.vue'
import { validateRegex, matchRegex, explainRegex } from './regex'
import { REGEX_TEMPLATES } from './templates'

const pattern = ref('')
const flags = ref('g')
const testText = ref('')
const selectedTemplate = ref<string | null>(null)

const templates = REGEX_TEMPLATES

const availableFlags = [
  { value: 'g', label: 'g', description: '全局匹配' },
  { value: 'i', label: 'i', description: '忽略大小写' },
  { value: 'm', label: 'm', description: '多行模式' },
  { value: 's', label: 's', description: '点号匹配换行' },
  { value: 'u', label: 'u', description: 'Unicode模式' },
]

function toggleFlag(flag: string) {
  if (flags.value.includes(flag)) {
    flags.value = flags.value.replace(flag, '')
  } else {
    flags.value += flag
  }
}

const validation = computed(() => validateRegex(pattern.value, flags.value))
const matchResult = computed(() => matchRegex(testText.value, pattern.value, flags.value))
const explanation = computed(() => explainRegex(pattern.value))

function applyTemplate(name: unknown) {
  if (typeof name !== 'string') return
  const template = templates.find(t => t.name === name)
  if (template) {
    pattern.value = template.pattern
    flags.value = template.flags
    testText.value = template.example
  }
}
</script>
