<template>
  <div class="home-page">
    <div class="tools-grid">
      <ToolCard
        v-for="(tool, index) in allTools"
        :key="tool.id"
        :tool="tool"
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

<style scoped>
.home-page {
  padding: var(--spacing-2xl) var(--spacing-3xl);
  max-width: 1200px;
  margin: 0 auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .home-page {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
