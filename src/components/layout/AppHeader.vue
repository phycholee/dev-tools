<template>
  <!-- Top navbar: always visible, sticky -->
  <header class="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-6xl mx-auto px-8 h-14">
      <!-- Logo (left) -->
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

      <!-- Actions (right) -->
      <div class="flex items-center gap-2">
        <Badge variant="secondary" class="font-mono text-xs">v0.1.0</Badge>
      </div>
    </div>
  </header>

  <!-- Hero section: homepage only -->
  <section
    v-if="isHome"
    class="relative flex items-center justify-center overflow-hidden"
    style="min-height: calc(33vh - 3.5rem)"
  >
    <!-- Background grid pattern -->
    <div class="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

    <div class="relative max-w-6xl mx-auto px-8 py-16 text-center">
      <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
        DevTools
      </h1>
      <p class="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
        开发者工具箱 — 为效率而生的在线工具集
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const route = useRoute()

const isHome = computed(() => route.path === '/')

function goHome() {
  router.push('/')
}
</script>
