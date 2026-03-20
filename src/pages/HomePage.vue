<template>
  <div class="home-page">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-gradient">DevTools</span>
        </h1>
        <p class="page-subtitle">
          常用开发工具集合，纯前端实现，数据不上传
        </p>
      </div>
      <div class="header-decoration">
        <div class="decoration-line"></div>
      </div>
    </header>

    <div class="tools-container">
      <section
        v-for="(category, catIndex) in toolCategories"
        :key="category.name"
        class="category-section"
        :style="{ animationDelay: `${catIndex * 150}ms` }"
      >
        <div class="section-header">
          <h2 class="category-title">{{ category.name }}</h2>
          <span class="tool-count">{{ category.tools.length }} 个工具</span>
        </div>
        <div class="tools-grid">
          <ToolCard
            v-for="(tool, toolIndex) in category.tools"
            :key="tool.id"
            :tool="tool"
            :style="{ animationDelay: `${(catIndex * 150) + (toolIndex * 80)}ms` }"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getToolsByCategory } from '../tools/registry'
import ToolCard from '../components/common/ToolCard.vue'

const toolCategories = getToolsByCategory()
</script>

<style scoped>
.home-page {
  padding: var(--spacing-2xl) var(--spacing-3xl);
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-3xl);
  position: relative;
}

.header-content {
  animation: fadeIn 0.5s ease-out;
}

.page-title {
  font-size: 40px;
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.title-gradient {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 500px;
  line-height: 1.6;
}

.header-decoration {
  margin-top: var(--spacing-xl);
}

.decoration-line {
  width: 60px;
  height: 3px;
  background: var(--accent-gradient);
  border-radius: 2px;
}

.tools-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.category-section {
  animation: fadeIn 0.5s ease-out backwards;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.category-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.tool-count {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

/* 响应式 */
@media (max-width: 768px) {
  .home-page {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
