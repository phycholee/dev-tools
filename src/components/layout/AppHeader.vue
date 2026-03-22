<template>
  <header class="bg-secondary border-b border-border/50 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-6xl mx-auto px-8 py-6">
      <div class="flex items-center gap-3 cursor-pointer select-none" @click="goHome">
        <!-- Logo icon -->
        <div class="flex items-center justify-center" style="color: hsl(239 84% 67%)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
            DevTools
          </span>
          <span class="text-xs text-muted-foreground font-medium tracking-wide">
            开发者工具箱
          </span>
        </div>
      </div>
      
      <Badge variant="secondary" class="font-mono text-xs">
        v0.1.0
      </Badge>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>
