<!-- src/tools/unicode-codec/UnicodeCodec.vue -->
<template>
  <div class="flex flex-col p-4 gap-6 w-full max-w-6xl mx-auto" style="min-height: calc(100vh - var(--header-height) - 2rem)">
    <div class="flex items-center gap-3">
      <CaseSensitive class="w-8 h-8 text-tool-unicode" />
      <div>
        <h1 class="text-xl font-bold text-foreground">Unicode编码转换</h1>
        <p class="text-sm text-muted-foreground">字符与 JavaScript Unicode 转义互转</p>
      </div>
    </div>

    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="text-sm text-muted-foreground">
        <strong class="text-foreground">使用提示：</strong>
        <strong>\uXXXX</strong> 是 JavaScript Unicode 转义格式。
        编码可选择全部字符或仅非 ASCII，解码时非法转义会保持原文。
      </div>
    </div>

    <Card class="p-4">
      <textarea
        v-model="input"
        placeholder="输入字符或 Unicode 转义..."
        class="w-full h-32 px-3 py-2 bg-card border border-input rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        aria-label="输入文本"
        autocomplete="off"
      />

      <div class="flex flex-wrap items-center gap-2 mt-4">
        <span class="text-sm text-muted-foreground">编码策略：</span>
        <Button
          v-for="option in encodeOptions"
          :key="option.value"
          @click="setEncodeMode(option.value)"
          :variant="encodeMode === option.value ? 'default' : 'outline'"
          size="sm"
        >
          {{ option.label }}
        </Button>
      </div>

      <div class="flex items-center gap-3 mt-4">
        <Button @click="handleEncode" variant="default" :disabled="!input.trim()">
          编码
        </Button>
        <Button @click="handleDecode" variant="secondary" :disabled="!input.trim()">
          解码
        </Button>
        <div class="flex-1" />
        <Button @click="handleClear" variant="ghost">
          清除
        </Button>
      </div>
    </Card>

    <Card class="p-4">
      <!-- Empty state -->
      <div v-if="!mode" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <CaseSensitive class="w-10 h-10 mb-3 opacity-40" />
        <p class="text-sm">输入文本后，点击"编码"或"解码"查看结果</p>
      </div>

      <!-- Result -->
      <template v-else>
        <h2 class="text-sm font-semibold text-foreground mb-3">
          {{ mode === 'encode' ? '编码结果' : '解码结果' }}
        </h2>
        <div class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto">
          <pre class="font-mono text-sm break-all select-text whitespace-pre-wrap flex-1">{{ result!.output }}</pre>
          <Button
            variant="ghost"
            size="sm"
            class="shrink-0 hover:bg-background"
            @click="copyToClipboard(result!.output)"
          >
            复制
          </Button>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CaseSensitive } from 'lucide-vue-next'
import { useClipboard } from '@/composables/useClipboard'
import {
  encodeUnicode,
  decodeUnicode,
  type UnicodeCodecResult,
  type UnicodeEncodeMode,
} from './unicode'

type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode | null>(null)
const encodeMode = ref<UnicodeEncodeMode>('non-ascii')
const result = ref<UnicodeCodecResult | null>(null)

const encodeOptions = [
  { value: 'non-ascii' as UnicodeEncodeMode, label: '仅非 ASCII' },
  { value: 'all' as UnicodeEncodeMode, label: '全部字符' },
]

const { copyToClipboard } = useClipboard()

function handleEncode(): void {
  mode.value = 'encode'
  result.value = encodeUnicode(input.value, encodeMode.value)
}

function handleDecode(): void {
  mode.value = 'decode'
  result.value = decodeUnicode(input.value)
}

function setEncodeMode(value: UnicodeEncodeMode): void {
  encodeMode.value = value
  if (mode.value === 'encode' && input.value.trim()) {
    result.value = encodeUnicode(input.value, encodeMode.value)
  }
}

function handleClear(): void {
  input.value = ''
  mode.value = null
  result.value = null
  encodeMode.value = 'non-ascii'
}
</script>