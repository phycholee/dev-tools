<template>
  <div class="home-page">
    <header class="page-header">
      <h1 class="page-title">DevTools 开发者工具箱</h1>
      <p class="page-subtitle">常用开发工具集合，纯前端实现，数据不上传</p>
    </header>

    <div class="tools-container">
      <section
        v-for="category in toolCategories"
        :key="category.name"
        class="category-section"
      >
        <h2 class="category-title">{{ category.name }}</h2>
        <div class="tools-grid">
          <ToolCard
            v-for="tool in category.tools"
            :key="tool.id"
            :tool="tool"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getToolsByCategory } from '@/tools/registry'
import ToolCard from '@/components/common/ToolCard.vue'

const toolCategories = getToolsByCategory()
</script>

<style scoped>
.home-page {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-accent);
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.tools-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

/* 响应式 */
@media (max-width: 768px) {
  .home-page {
    padding: var(--spacing-md);
  }

  .page-title {
    font-size: 22px;
  }

  .tools-grid {
    justify-content: center;
  }

  .tool-card {
    width: 100%;
    max-width: 280px;
  }
}
</style>
