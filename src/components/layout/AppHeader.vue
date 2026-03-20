<template>
  <header class="app-header">
    <div class="logo" @click="goHome">
      <span class="logo-icon">🛠</span>
      <span class="logo-text">DevTools</span>
    </div>
    <div class="header-right">
      <span class="version">v0.1.0</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 var(--spacing-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 20px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-accent);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.version {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
