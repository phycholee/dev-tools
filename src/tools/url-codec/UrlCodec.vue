<!-- src/tools/url-codec/UrlCodec.vue -->
<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-3xl">🔗</span>
      <div>
        <h1 class="text-xl font-bold text-foreground">URL 编解码</h1>
        <p class="text-sm text-muted-foreground">URL编码与解码工具</p>
      </div>
    </div>

    <!-- Help tip -->
    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="flex items-start gap-2">
        <span class="text-muted-foreground text-sm">💡</span>
        <div class="text-sm text-muted-foreground">
          <strong class="text-foreground">使用提示：</strong> 
          <strong>encodeURIComponent</strong> 用于编码URL参数值（会编码 = & # 等字符）。
          <strong>encodeURI</strong> 用于编码完整URL（保留 : / ? # & = 等字符）。
          <span class="text-xs opacity-75 ml-2">解码时自动识别编码类型</span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <Card class="p-4">
      <textarea
        v-model="input"
        placeholder="输入文本或 URL..."
        class="w-full h-32 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        aria-label="输入文本"
      />

      <!-- Action buttons -->
      <div class="flex items-center gap-3 mt-4">
        <Button
          @click="handleEncode"
          variant="default"
          :disabled="!input.trim()"
        >
          编码
        </Button>
        <Button
          @click="handleDecode"
          variant="secondary"
          :disabled="!input.trim()"
        >
          解码
        </Button>
        <div class="flex-1" />
        <Button @click="handleClear" variant="ghost">
          清除
        </Button>
      </div>
    </Card>

    <!-- Encode results: two Cards stacked vertically -->
    <div
      v-if="mode === 'encode'"
      class="flex flex-col gap-6"
    >
      <!-- encodeURIComponent result -->
      <Card class="p-4">
        <div class="mb-1">
          <h2 class="text-sm font-semibold text-foreground">encodeURIComponent</h2>
        </div>
        <p class="text-xs text-muted-foreground mb-3">适用：URL 参数值（编码 = & # 等）</p>
        <div class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto">
          <pre class="font-mono text-sm break-all select-all whitespace-pre-wrap flex-1">{{ encodeComponentResult?.output }}</pre>
          <Button
            variant="ghost"
            size="sm"
            class="shrink-0 hover:bg-background"
            :disabled="!encodeComponentResult?.success"
            @click="copyToClipboard(encodeComponentResult!.output)"
          >
            复制
          </Button>
        </div>
      </Card>

      <!-- encodeURI result -->
      <Card class="p-4">
        <div class="mb-1">
          <h2 class="text-sm font-semibold text-foreground">encodeURI</h2>
        </div>
        <p class="text-xs text-muted-foreground mb-3">适用：完整 URL（保留 : / ? # & = 等）</p>
        <div class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto">
          <pre class="font-mono text-sm break-all select-all whitespace-pre-wrap flex-1">{{ encodeUriResult?.output }}</pre>
          <Button
            variant="ghost"
            size="sm"
            class="shrink-0 hover:bg-background"
            :disabled="!encodeUriResult?.success"
            @click="copyToClipboard(encodeUriResult!.output)"
          >
            复制
          </Button>
        </div>
      </Card>
    </div>

    <!-- Decode result: one full-width Card -->
    <Card v-if="mode === 'decode'" class="p-4">
      <h2 class="text-sm font-semibold text-foreground mb-3">解码结果</h2>

      <!-- Error state -->
      <div
        v-if="decodeResult && !decodeResult.success"
        class="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"
      >
        <span>⚠</span>
        <span>{{ decodeResult.error }}</span>
      </div>

      <!-- Success state -->
      <div
        v-else-if="decodeResult?.success"
        class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto"
      >
        <pre class="font-mono text-sm break-all select-all whitespace-pre-wrap flex-1">{{ decodeResult.output }}</pre>
        <Button
          variant="ghost"
          size="sm"
          class="shrink-0 hover:bg-background"
          :disabled="!decodeResult.success"
          @click="copyToClipboard(decodeResult.output)"
        >
          复制
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  encodeURIComponentSafe,
  encodeURISafe,
  decodeUrlSafe,
  type UrlCodecResult,
} from './url'

type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode | null>(null)
const encodeComponentResult = ref<UrlCodecResult | null>(null)
const encodeUriResult = ref<UrlCodecResult | null>(null)
const decodeResult = ref<UrlCodecResult | null>(null)

const toast = inject<(msg: string) => void>('toast')

function handleEncode(): void {
  mode.value = 'encode'
  encodeComponentResult.value = encodeURIComponentSafe(input.value)
  encodeUriResult.value = encodeURISafe(input.value)
  decodeResult.value = null
}

function handleDecode(): void {
  mode.value = 'decode'
  decodeResult.value = decodeUrlSafe(input.value)
  encodeComponentResult.value = null
  encodeUriResult.value = null
}

function handleClear(): void {
  input.value = ''
  mode.value = null
  encodeComponentResult.value = null
  encodeUriResult.value = null
  decodeResult.value = null
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast?.('已复制到剪贴板')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    toast?.('已复制到剪贴板')
  }
}
</script>
