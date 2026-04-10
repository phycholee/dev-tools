<template>
  <header class="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
    <div
      class="flex items-center justify-between h-14 transition-all duration-200"
      :class="isFullscreen ? 'w-full px-8' : 'max-w-6xl mx-auto px-8'"
    >
      <a href="/" class="flex items-center gap-2.5 cursor-pointer select-none -ml-5" @click.prevent="goHome">
        <div class="flex items-center justify-center text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <span class="text-lg font-bold text-foreground tracking-tight">DevTools</span>
      </a>

      <div class="flex items-center gap-2">
        <Button
          v-if="currentToolSupportsFullscreen"
          variant="ghost"
          size="icon"
          @click="toggleFullscreen"
          class="h-9 w-9"
          :title="isFullscreen ? '退出全屏' : '全屏模式'"
          :aria-label="isFullscreen ? '退出全屏' : '全屏模式'"
        >
          <GalleryHorizontal class="h-4 w-4" />
        </Button>
        <ToggleTheme />
        <Badge variant="secondary" class="font-mono text-xs">v0.1.0</Badge>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { GalleryHorizontal } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ToggleTheme } from '@/components/ui/toggle-theme'

const router = useRouter()
const isFullscreen = inject<Ref<boolean>>('isFullscreen')!
const currentToolSupportsFullscreen = inject<Ref<boolean>>('currentToolSupportsFullscreen')!
const toggleFullscreen = inject<() => void>('toggleFullscreen')!

function goHome() {
  router.push('/')
}
</script>
