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
      <div class="card-arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
  flex-direction: column;
  width: 100%;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
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
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(99, 102, 241, 0.06),
    transparent 40%
  );
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.tool-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--glow-accent);
}

.tool-card:hover .card-glow {
  opacity: 1;
}

.tool-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

.card-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: 
    background var(--transition-base),
    transform var(--transition-base);
}

.tool-card:hover .card-icon-wrapper {
  background: rgba(99, 102, 241, 0.15);
  transform: scale(1.05);
}

.card-icon {
  font-size: 20px;
  transition: transform var(--transition-base);
}

.tool-card:hover .card-icon {
  transform: scale(1.1);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.tool-card:hover .card-name {
  color: var(--text-accent);
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.card-arrow {
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateX(-5px) translateY(-50%);
  color: var(--text-tertiary);
  opacity: 0;
  transition: 
    opacity var(--transition-base),
    transform var(--transition-base);
}

.tool-card:hover .card-arrow {
  color: var(--text-accent);
}

/* 动画入场 */
.tool-card {
  animation: fadeIn 0.4s ease-out backwards;
}

@media (max-width: 768px) {
  .tool-card {
    padding: var(--spacing-md);
  }
  
  .card-icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .card-icon {
    font-size: 18px;
  }
}
</style>
