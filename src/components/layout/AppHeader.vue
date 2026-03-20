<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo" @click="goHome">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-title">DevTools</span>
          <span class="logo-subtitle">开发者工具箱</span>
        </div>
      </div>
      <div class="header-right">
        <span class="version-badge">v0.1.0</span>
      </div>
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
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-2xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  user-select: none;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.85;
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
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.header-right {
  display: flex;
  align-items: center;
}

.version-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--spacing-lg) var(--spacing-lg);
  }
  
  .logo-title {
    font-size: 20px;
  }
  
  .logo-subtitle {
    font-size: 12px;
  }
}
</style>
