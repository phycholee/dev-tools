<template>
  <router-link :to="tool.path" class="tool-card">
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="card-icon-wrapper">
        <span class="card-icon">{{ tool.icon }}</span>
      </div>
      <div class="card-info">
        <div class="card-name">{{ tool.name }}</div>
        <div class="card-desc">{{ tool.description }}</div>
      </div>
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  text-decoration: none;
  overflow: hidden;
  transition: 
    border-color var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base);
  cursor: pointer;
}

/* 发光效果层 */
.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(99, 102, 241, 0.08),
    transparent 40%
  );
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.tool-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-4px);
  box-shadow: var(--glow-accent-strong);
}

.tool-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-md);
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  transition: 
    background var(--transition-base),
    transform var(--transition-base);
}

.tool-card:hover .card-icon-wrapper {
  background: rgba(99, 102, 241, 0.2);
  transform: scale(1.1);
}

.card-icon {
  font-size: 28px;
  transition: transform var(--transition-base);
}

.tool-card:hover .card-icon {
  transform: scale(1.15);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.tool-card:hover .card-name {
  color: var(--text-accent);
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  max-width: 200px;
}

/* 动画入场 */
.tool-card {
  animation: fadeIn 0.4s ease-out backwards;
}

@media (max-width: 768px) {
  .tool-card {
    padding: var(--spacing-lg);
    aspect-ratio: auto;
  }
  
  .card-icon-wrapper {
    width: 56px;
    height: 56px;
  }
  
  .card-icon {
    font-size: 24px;
  }
  
  .card-name {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: var(--spacing-lg);
    aspect-ratio: auto;
  }
  
  .card-content {
    flex-direction: row;
    text-align: left;
    gap: var(--spacing-md);
  }
  
  .card-icon-wrapper {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
  
  .card-icon {
    font-size: 20px;
  }
  
  .card-desc {
    max-width: none;
  }
}
</style>
