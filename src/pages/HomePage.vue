<template>
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
</template>

<script setup lang="ts">
import { tools } from '../tools/registry'
import ToolCard from '../components/common/ToolCard.vue'

const allTools = tools
</script>
