<template>
  <router-link :to="tool.path" class="block group">
    <Card
      class="tool-card relative overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/30 min-h-[160px]"
      :data-tool="tool.id"
    >
      <!-- Left accent bar -->
      <div
        class="absolute top-4 bottom-4 left-0 w-1.5 rounded-r transition-all duration-250 group-hover:w-2"
        :class="toolAccentClass"
      />
      
      <!-- Bottom glow -->
      <div
        class="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 transition-all duration-250 group-hover:opacity-70 group-hover:h-1"
        :class="toolGlowClass"
      />

      <CardContent class="flex items-center gap-5 p-8 pl-10">
        <!-- Icon -->
        <div
          class="flex items-center justify-center w-20 h-20 rounded-xl shrink-0 transition-all duration-250 border group-hover:scale-105"
          :class="toolIconContainerClass"
        >
          <span
            class="text-3xl transition-all duration-250"
            :class="toolIconClass"
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
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import type { ToolDefinition } from '../../types/tool'

const props = defineProps<{
  tool: ToolDefinition
}>()

// Tool-specific color classes based on tool ID
const toolAccentClass = computed(() => {
  const colorMap: Record<string, string> = {
    'json-formatter': 'bg-tool-json',
    'timestamp-converter': 'bg-tool-timestamp',
    'url-codec': 'bg-tool-url',
    'cron-parser': 'bg-tool-cron',
  }
  return colorMap[props.tool.id] || 'bg-brand'
})

const toolGlowClass = computed(() => {
  const colorMap: Record<string, string> = {
    'json-formatter': 'bg-gradient-to-r from-transparent via-tool-json to-transparent',
    'timestamp-converter': 'bg-gradient-to-r from-transparent via-tool-timestamp to-transparent',
    'url-codec': 'bg-gradient-to-r from-transparent via-tool-url to-transparent',
    'cron-parser': 'bg-gradient-to-r from-transparent via-tool-cron to-transparent',
  }
  return colorMap[props.tool.id] || 'bg-gradient-to-r from-transparent via-brand to-transparent'
})

const toolIconContainerClass = computed(() => {
  const colorMap: Record<string, string> = {
    'json-formatter': 'bg-tool-json/10 border-tool-json/20',
    'timestamp-converter': 'bg-tool-timestamp/10 border-tool-timestamp/20',
    'url-codec': 'bg-tool-url/10 border-tool-url/20',
    'cron-parser': 'bg-tool-cron/10 border-tool-cron/20',
  }
  return colorMap[props.tool.id] || 'bg-brand/10 border-brand/20'
})

const toolIconClass = computed(() => {
  const colorMap: Record<string, string> = {
    'json-formatter': 'text-tool-json',
    'timestamp-converter': 'text-tool-timestamp',
    'url-codec': 'text-tool-url',
    'cron-parser': 'text-tool-cron',
  }
  return colorMap[props.tool.id] || 'text-brand'
})
</script>
