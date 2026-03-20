<template>
  <router-link :to="tool.path" class="tool-card">
    <div class="card-icon">{{ tool.icon }}</div>
    <div class="card-content">
      <div class="card-name">{{ tool.name }}</div>
      <div class="card-desc">{{ tool.description }}</div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { ToolDefinition } from '../../types/tool'

defineProps<{
  tool: ToolDefinition
}>()
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 160px;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tool-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-decoration: none;
}

.card-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
  color: var(--text-accent);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}
@media (max-width: 768px) {
  .tool-card {
    width: 100%;
    max-width: 280px;
  }
}
</style>
