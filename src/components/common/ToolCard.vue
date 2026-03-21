<template>
  <router-link :to="tool.path" class="block group">
    <Card
      class="relative overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/30"
      :style="{ '--tool-color': tool.color || '#6366f1' }"
    >
      <!-- Left accent bar -->
      <div
        class="absolute top-4 bottom-4 left-0 w-1.5 rounded-r transition-all duration-250 group-hover:w-2"
        :style="{ background: `linear-gradient(180deg, ${tool.color || '#6366f1'} 0%, ${tool.color || '#6366f1'}60 100%)` }"
      />
      
      <!-- Bottom glow -->
      <div
        class="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 transition-all duration-250 group-hover:opacity-70 group-hover:h-1"
        :style="{ background: `linear-gradient(90deg, transparent 0%, ${tool.color || '#6366f1'} 20%, ${tool.color || '#6366f1'} 80%, transparent 100%)` }"
      />

      <CardContent class="flex items-center gap-5 p-6 pl-8">
        <!-- Icon -->
        <div
          class="flex items-center justify-center w-16 h-16 rounded-xl shrink-0 transition-all duration-250 border group-hover:scale-105"
          :style="{ 
            background: `color-mix(in srgb, ${tool.color || '#6366f1'} 15%, var(--bg-tertiary))`,
            borderColor: `color-mix(in srgb, ${tool.color || '#6366f1'} 20%, transparent)`
          }"
        >
          <span
            class="text-2xl transition-all duration-250"
            :style="{ color: tool.color || '#6366f1' }"
          >
            {{ tool.icon }}
          </span>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-1">
          <div class="text-xl font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
            {{ tool.name }}
          </div>
          <div class="text-sm text-muted-foreground leading-relaxed">
            {{ tool.description }}
          </div>
        </div>
      </CardContent>
    </Card>
  </router-link>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import type { ToolDefinition } from '../../types/tool'

defineProps<{
  tool: ToolDefinition
}>()
</script>
