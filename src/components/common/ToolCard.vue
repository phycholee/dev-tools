<template>
  <router-link 
    :to="tool.path" 
    class="tool-card"
    :style="{ '--tool-color': tool.color || '#6366f1' }"
  >
    <div class="card-accent"></div>
    <div class="card-bottom-glow"></div>
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
  justify-content: flex-start;
  padding: var(--spacing-xl) var(--spacing-2xl);
  padding-left: calc(var(--spacing-2xl) + 12px);
  background: 
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--tool-color) 6%, var(--bg-card)) 0%,
      var(--bg-card) 50%
    ),
    var(--bg-card);
  border: 1px solid color-mix(in srgb, var(--tool-color) 15%, var(--border-color));
  border-radius: var(--radius-xl);
  text-decoration: none;
  overflow: hidden;
  transition: 
    border-color var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base),
    background var(--transition-base);
  cursor: pointer;
  min-height: 200px;
}

/* 左边颜色装饰条 - 更宽 */
.card-accent {
  position: absolute;
  top: var(--spacing-lg);
  bottom: var(--spacing-lg);
  left: 0;
  width: 6px;
  background: linear-gradient(
    180deg,
    var(--tool-color) 0%,
    color-mix(in srgb, var(--tool-color) 60%, transparent) 100%
  );
  border-radius: 0 3px 3px 0;
  opacity: 0.8;
  transition: 
    opacity var(--transition-base),
    width var(--transition-base);
}

.tool-card:hover .card-accent {
  opacity: 1;
  width: 8px;
}

/* 底部渐变色带 */
.card-bottom-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--tool-color) 20%,
    var(--tool-color) 80%,
    transparent 100%
  );
  opacity: 0.4;
  transition: opacity var(--transition-base), height var(--transition-base);
}

.tool-card:hover .card-bottom-glow {
  opacity: 0.7;
  height: 4px;
}

/* 发光效果层 */
.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(
      400px circle at var(--mouse-x, 30%) var(--mouse-y, 50%),
      color-mix(in srgb, var(--tool-color) 6%, transparent),
      transparent 40%
    ),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--tool-color) 3%, transparent) 0%,
      transparent 50%
    );
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.tool-card:hover {
  border-color: color-mix(in srgb, var(--tool-color) 35%, transparent);
  transform: translateY(-4px);
  background: 
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--tool-color) 10%, var(--bg-card)) 0%,
      color-mix(in srgb, var(--tool-color) 3%, var(--bg-card)) 50%,
      var(--bg-card) 100%
    ),
    var(--bg-card);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px color-mix(in srgb, var(--tool-color) 15%, transparent),
    0 4px 20px color-mix(in srgb, var(--tool-color) 10%, transparent);
}

.tool-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  gap: var(--spacing-lg);
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: color-mix(in srgb, var(--tool-color) 15%, var(--bg-tertiary));
  border-radius: var(--radius-lg);
  flex-shrink: 0;
  transition: 
    background var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base);
  border: 1px solid color-mix(in srgb, var(--tool-color) 20%, transparent);
}

.tool-card:hover .card-icon-wrapper {
  background: color-mix(in srgb, var(--tool-color) 25%, var(--bg-tertiary));
  transform: scale(1.08);
  box-shadow: 
    0 0 24px color-mix(in srgb, var(--tool-color) 20%, transparent),
    inset 0 0 12px color-mix(in srgb, var(--tool-color) 10%, transparent);
  border-color: color-mix(in srgb, var(--tool-color) 35%, transparent);
}

.card-icon {
  font-size: 28px;
  color: var(--tool-color);
  transition: transform var(--transition-base);
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--tool-color) 30%, transparent));
}

.tool-card:hover .card-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 12px color-mix(in srgb, var(--tool-color) 50%, transparent));
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.card-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.tool-card:hover .card-name {
  color: var(--tool-color);
}

.card-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 动画入场 */
.tool-card {
  animation: fadeIn 0.4s ease-out backwards;
}

@media (max-width: 768px) {
  .tool-card {
    padding: var(--spacing-md) var(--spacing-lg);
    padding-left: calc(var(--spacing-lg) + 12px);
  }
  
  .card-icon-wrapper {
    width: 52px;
    height: 52px;
  }
  
  .card-icon {
    font-size: 24px;
  }
  
  .card-name {
    font-size: 18px;
  }
  
  .card-content {
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: var(--spacing-md);
    padding-left: calc(var(--spacing-md) + 12px);
  }
  
  .card-content {
    flex-direction: row;
    text-align: left;
    gap: var(--spacing-sm);
  }
  
  .card-icon-wrapper {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
  
  .card-icon {
    font-size: 22px;
  }
}
</style>
