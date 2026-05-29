<!-- src/tools/url-codec/UrlCodec.vue -->
<template>
  <div class="flex flex-col p-4 gap-6 w-full max-w-6xl mx-auto" style="min-height: calc(100vh - var(--header-height) - 2rem)">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Link class="w-8 h-8 text-tool-url" />
      <div>
        <h1 class="text-xl font-bold text-foreground">URL 编解码</h1>
        <p class="text-sm text-muted-foreground">URL编码与解码工具</p>
      </div>
    </div>

    <!-- Help tip -->
    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="text-sm text-muted-foreground">
        <strong class="text-foreground">使用提示：</strong>
        <strong>encodeURIComponent</strong> 用于编码URL参数值（会编码 = & # 等字符）。
        <strong>encodeURI</strong> 用于编码完整URL（保留 : / ? # & = 等字符）。
        <span class="text-xs opacity-75 ml-2">解码时自动识别编码类型</span>
      </div>
    </div>

    <!-- Input -->
    <Card class="p-4">
      <textarea
        v-model="input"
        placeholder="输入文本或 URL..."
        class="w-full h-32 px-3 py-2 bg-card border border-input rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        aria-label="输入文本"
        autocomplete="off"
      />

      <!-- Format selector (for encoding) -->
      <div v-if="mode === 'encode'" class="flex items-center gap-2 mt-4">
        <span class="text-sm text-muted-foreground">模式：</span>
        <Button
          v-for="opt in encodeOptions"
          :key="opt.value"
          @click="encodeMode = opt.value"
          :variant="encodeMode === opt.value ? 'default' : 'outline'"
          size="sm"
        >
          {{ opt.label }}
        </Button>
      </div>

      <!-- Action buttons -->
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

    <!-- Output -->
    <Card v-if="result" class="p-4">
      <h2 class="text-sm font-semibold text-foreground mb-3">
        {{ mode === 'encode' ? '编码结果' : '解码结果' }}
      </h2>

      <!-- Error state -->
      <div
        v-if="!result.success"
        class="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"
        role="alert"
      >
        <span>⚠</span>
        <span>{{ result.error }}</span>
      </div>

      <!-- Success state -->
      <div
        v-else
        class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto"
      >
        <pre class="font-mono text-sm break-all select-all whitespace-pre-wrap flex-1">{{ result.output }}</pre>
        <Button
          variant="ghost"
          size="sm"
          class="shrink-0 hover:bg-background"
          @click="copyToClipboard(result.output)"
        >
          复制
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from 'lucide-vue-next'
import {
  encodeURIComponentSafe,
  encodeURISafe,
  decodeUrlSafe,
  type UrlCodecResult,
} from './url'
import { useClipboard } from '@/composables/useClipboard'

type Mode = 'encode' | 'decode'
type UrlEncodeMode = 'component' | 'uri'

const input = ref('')
const mode = ref<Mode | null>(null)
const encodeMode = ref<UrlEncodeMode>('component')
const result = ref<UrlCodecResult | null>(null)

const encodeOptions = [
  { value: 'component' as UrlEncodeMode, label: 'encodeURIComponent' },
  { value: 'uri' as UrlEncodeMode, label: 'encodeURI' },
]

const { copyToClipboard } = useClipboard()

watch(encodeMode, () => {
  if (mode.value === 'encode' && input.value.trim()) {
    result.value = encodeMode.value === 'component'
      ? encodeURIComponentSafe(input.value)
      : encodeURISafe(input.value)
  }
})

function handleEncode(): void {
  mode.value = 'encode'
  result.value = encodeMode.value === 'component'
    ? encodeURIComponentSafe(input.value)
    : encodeURISafe(input.value)
}

function handleDecode(): void {
  mode.value = 'decode'
  result.value = decodeUrlSafe(input.value)
}

function handleClear(): void {
  input.value = ''
  mode.value = null
  result.value = null
  encodeMode.value = 'component'
}
</script>