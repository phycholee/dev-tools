<template>
  <header class="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-6xl mx-auto px-8 h-14">
      <div class="flex items-center gap-2.5 cursor-pointer select-none" @click="goHome">
        <div class="flex items-center justify-center" style="color: hsl(239 84% 67%)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <span class="text-lg font-bold text-foreground tracking-tight">DevTools</span>
      </div>

      <div class="flex items-center gap-2">
        <ToggleTheme />
        <Badge variant="secondary" class="font-mono text-xs">v0.1.0</Badge>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { ToggleTheme } from '@/components/ui/toggle-theme'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>
