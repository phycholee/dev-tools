<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <div
        v-for="category in toolCategories"
        :key="category.name"
        class="nav-category"
      >
        <div class="category-title">{{ category.name }}</div>
        <router-link
          v-for="tool in category.tools"
          :key="tool.id"
          :to="tool.path"
          class="nav-item"
          :class="{ active: isActive(tool.path) }"
        >
          <span class="nav-icon">{{ tool.icon }}</span>
          <span class="nav-name">{{ tool.name }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
  </template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getToolsByCategory } from '@/tools/registry'

const route = useRoute()
const toolCategories = getToolsByCategory()

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
.app-sidebar {
  width: 220px;
  height: 100%;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.sidebar-nav {
  padding: var(--spacing-md) 0;
}

.nav-category {
  margin-bottom: var(--spacing-md);
}

.category-title {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.nav-item:hover {
  background: var(--bg-hover);
  text-decoration: none;
}

.nav-item.active {
  background: var(--bg-tertiary);
  color: var(--text-accent);
}

.nav-icon {
  width: 24px;
  text-align: center;
  font-size: 14px;
}

.nav-name {
  font-size: 13px;
}
</style>
