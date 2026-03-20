<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo" @click="goHome">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <span class="logo-text">DevTools</span>
      </div>
    </div>
    <div class="header-right">
      <span class="version-badge">v0.1.0</span>
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
  height: 56px;
  padding: 0 var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-accent);
  transition: transform var(--transition-base);
}

.logo:hover .logo-icon {
  transform: scale(1.05);
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.version-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}
</style>
