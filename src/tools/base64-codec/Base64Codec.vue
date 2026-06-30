<!-- src/tools/base64-codec/Base64Codec.vue -->
<template>
  <div class="flex flex-col p-4 gap-6 w-full max-w-6xl mx-auto" style="min-height: calc(100vh - var(--header-height) - 2rem)">
    <div class="flex items-center gap-3">
      <Binary class="w-8 h-8 text-tool-base64" />
      <div>
        <h1 class="text-xl font-bold text-foreground">Base64编解码</h1>
        <p class="text-sm text-muted-foreground">Base64编码与解码工具，支持多种格式</p>
      </div>
    </div>

    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="text-sm text-muted-foreground">
        <strong class="text-foreground">使用提示：</strong>
        <strong>标准Base64</strong> 使用 + 和 / 字符。
        <strong>URL安全</strong> 使用 - 和 _ 字符，保留填充符 =，适合URL参数。
        <strong>Base64url</strong> 使用 - 和 _ 字符，移除填充符，适合JWT令牌、URL路径、文件名。
        <span class="text-xs opacity-75 ml-2">解码时自动识别格式</span>
      </div>
    </div>

    <Card class="p-4">
      <textarea
        v-model="input"
        placeholder="输入文本或 Base64 字符串..."
        class="w-full h-32 px-3 py-2 bg-card border border-input rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        aria-label="输入文本"
        autocomplete="off"
      />

      <div class="flex flex-wrap items-center gap-2 mt-4">
        <span class="text-sm text-muted-foreground">编码格式：</span>
        <Button
          v-for="fmt in formats"
          :key="fmt.value"
          @click="format = fmt.value"
          :variant="format === fmt.value ? 'default' : 'outline'"
          size="sm"
        >
          {{ fmt.label }}
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
        <Binary class="w-10 h-10 mb-3 opacity-40" />
        <p class="text-sm">输入文本后，点击"编码"或"解码"查看结果</p>
      </div>

      <!-- Result -->
      <template v-else>
        <h2 class="text-sm font-semibold text-foreground mb-3">
          {{ mode === 'encode' ? '编码结果' : '解码结果' }}
        </h2>

        <div
          v-if="!result!.success"
          class="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"
          role="alert"
        >
          <span>⚠</span>
          <span>{{ result!.error }}</span>
        </div>

        <div
          v-else
          class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto"
        >
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
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Binary } from 'lucide-vue-next'
import {
  encodeBase64,
  decodeBase64,
  type Base64CodecResult,
  type Base64Format,
} from './base64'
import { useClipboard } from '@/composables/useClipboard'

type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode | null>(null)
const format = ref<Base64Format>('standard')
const result = ref<Base64CodecResult | null>(null)

const formats = [
  { value: 'standard' as Base64Format, label: '标准Base64' },
  { value: 'url-safe' as Base64Format, label: 'URL安全' },
  { value: 'base64url' as Base64Format, label: 'Base64url' },
]

const { copyToClipboard } = useClipboard()

watch(format, () => {
  if (mode.value === 'encode' && input.value.trim()) {
    result.value = encodeBase64(input.value, format.value)
  }
})

function handleEncode() {
  mode.value = 'encode'
  result.value = encodeBase64(input.value, format.value)
}

function handleDecode() {
  mode.value = 'decode'
  result.value = decodeBase64(input.value)
}

function handleClear() {
  input.value = ''
  mode.value = null
  result.value = null
  format.value = 'standard'
}
</script>