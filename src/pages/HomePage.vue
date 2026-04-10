<template>
  <div>
    <!-- Hero -->
    <section class="relative flex items-center justify-center overflow-hidden" :style="{ minHeight: 'calc(33vh - var(--header-height))' }">
      <div class="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" aria-hidden="true" />
      <div class="relative max-w-6xl mx-auto px-8 py-16 text-center">
        <h1 class="text-[2.441rem] md:text-[3.157rem] font-extrabold tracking-tight text-foreground">
          DevTools
        </h1>
        <p class="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          开发者工具箱 — 为效率而生的在线工具集
        </p>
      </div>
    </section>

    <!-- Tool cards -->
    <div class="pt-8 pb-16 px-8 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToolCard
          v-for="(tool, index) in allTools"
          :key="tool.id"
          :tool="tool"
          class="animate-fadeIn"
          :style="{ animationDelay: `${index * 80}ms` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { tools } from '../tools/registry'
import ToolCard from '../components/common/ToolCard.vue'

const allTools = tools
</script>
