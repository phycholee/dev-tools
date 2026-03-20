<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <div
        v-for="(category, index) in toolCategories"
        :key="category.name"
        class="nav-category"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="category-label">{{ category.name }}</div>
        <div class="category-items">
          <router-link
            v-for="tool in category.tools"
            :key="tool.id"
            :to="tool.path"
            class="nav-item"
            :class="{ active: isActive(tool.path) }"
          >
            <span class="nav-icon">{{ tool.icon }}</span>
            <span class="nav-name">{{ tool.name }}</span>
            <div class="nav-indicator"></div>
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getToolsByCategory } from '../../tools/registry'

const route = useRoute()
const toolCategories = getToolsByCategory()

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
.app-sidebar {
  width: 240px;
  height: 100%;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  overflow-y: auto;
  padding: var(--spacing-lg) 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.nav-category {
  animation: slideInLeft 0.3s ease-out backwards;
}

.category-label {
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 var(--spacing-sm);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: 
    background var(--transition-fast),
    color var(--transition-fast);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--text-accent);
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--accent-primary);
  border-radius: 0 2px 2px 0;
  transition: height var(--transition-base);
}

.nav-item.active .nav-indicator {
  height: 16px;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 14px;
  flex-shrink: 0;
}

.nav-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
