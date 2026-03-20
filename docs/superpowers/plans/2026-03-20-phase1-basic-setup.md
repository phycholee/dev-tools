# DevTools 阶段一：基础搭建 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 DevTools 项目基础架构，包含 Vite + Vue 3 + TypeScript 初始化、暗色主题、路由配置、工具注册机制、基础布局组件和主页面

**Architecture:** 使用 Vite 创建 Vue 3 + TypeScript 项目，实现工具注册机制（registry.ts）统一管理所有工具，通过 Vue Router 4 实现路由，主页读取注册列表自动生成工具卡片

**Tech Stack:** Vite 5.x, Vue 3.x, TypeScript 5.x, Vue Router 4.x, CSS Variables

---

## 文件结构

```
devtools/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css          # 全局样式（暗色主题变量）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue     # 顶部导航
│   │   │   ├── AppSidebar.vue    # 工具列表侧边栏
│   │   │   └── AppLayout.vue     # 布局容器
│   │   └── common/
│   │       └── ToolCard.vue      # 工具卡片组件
│   ├── pages/
│   │   └── HomePage.vue          # 主页面 - 工具列表
│   ├── tools/
│   │   ├── registry.ts           # 工具注册表
│   │   ├── json-formatter/
│   │   │   └── JsonFormatter.vue # JSON格式化工具页（占位）
│   │   └── timestamp-converter/
│   │       └── TimestampConverter.vue # 时间戳转换工具页（占位）
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── types/
│   │   └── tool.ts               # 工具类型定义
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── .gitignore
```

---

## Task 1: Vite 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.ts`
- Create: `src/App.vue`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "devtools",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevTools - 开发者工具箱</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 .gitignore**

```
node_modules
dist
dist-ssr
*.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

- [ ] **Step 7: 创建 src/main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

- [ ] **Step 8: 创建 src/App.vue（基础版本）**

```vue
<template>
  <div id="app">
    <h1>DevTools</h1>
    <p>项目初始化成功</p>
  </div>
</template>

<script setup lang="ts">
// 基础 App 组件
</script>

<style scoped>
#app {
  padding: 20px;
}
</style>
```

- [ ] **Step 9: 安装依赖并验证**

```bash
npm install
npm run dev
```

Expected: 开发服务器启动，浏览器访问 http://localhost:5173 显示 "DevTools 项目初始化成功"

- [ ] **Step 10: Git 提交**

```bash
git add .
git commit -m "chore: 初始化 Vite + Vue 3 + TypeScript 项目"
```

---

## Task 2: 暗色主题基础样式

**Files:**
- Create: `src/assets/styles/main.css`

- [ ] **Step 1: 创建全局样式文件**

```css
/* src/assets/styles/main.css */

/* CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 暗色主题变量 */
:root {
  /* 背景色 */
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d2d;
  --bg-hover: #37373d;

  /* 文字色 */
  --text-primary: #cccccc;
  --text-secondary: #858585;
  --text-accent: #4ec9b0;

  /* 边框色 */
  --border-color: #3c3c3c;

  /* 功能色 */
  --success: #4ec9b0;
  --error: #f44747;
  --warning: #cca700;
  --info: #3794ff;

  /* 按钮色 */
  --btn-primary: #0e639c;
  --btn-primary-hover: #1177bb;

  /* JSON高亮色 */
  --json-key: #9cdcfe;
  --json-string: #ce9178;
  --json-number: #b5cea8;
  --json-boolean: #569cd6;
  --json-null: #569cd6;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* 字体 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
}

/* 基础样式 */
html,
body {
  height: 100%;
}

body {
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

/* 链接 */
a {
  color: var(--text-accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* 按钮基础样式 */
button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
}

/* 输入框基础样式 */
input,
textarea {
  font-family: inherit;
  font-size: inherit;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--bg-hover);
}
```

- [ ] **Step 2: 更新 App.vue 验证样式**

```vue
<template>
  <div id="app">
    <h1 style="color: var(--text-accent)">DevTools</h1>
    <p>暗色主题已启用</p>
    <button style="background: var(--btn-primary); color: white; border: none; padding: 8px 16px; border-radius: 4px;">
      测试按钮
    </button>
  </div>
</template>

<script setup lang="ts">
// 基础 App 组件
</script>

<style scoped>
#app {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  min-height: 100vh;
}

h1 {
  margin-bottom: var(--spacing-md);
}

p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

button:hover {
  background: var(--btn-primary-hover);
}
</style>
```

- [ ] **Step 3: 验证样式生效**

```bash
npm run dev
```

Expected: 页面显示暗色背景，青色标题，灰色文字，蓝色按钮

- [ ] **Step 4: Git 提交**

```bash
git add src/assets/styles/main.css src/App.vue
git commit -m "feat(style): 添加暗色主题基础样式"
```

---

## Task 3: 工具类型定义和注册机制

**Files:**
- Create: `src/types/tool.ts`
- Create: `src/tools/registry.ts`

- [ ] **Step 1: 创建工具类型定义**

```typescript
// src/types/tool.ts

import { Component } from 'vue'

/**
 * 工具定义接口
 */
export interface ToolDefinition {
  /** 工具唯一标识 */
  id: string
  /** 工具名称 */
  name: string
  /** 路由路径 */
  path: string
  /** 图标（文本或emoji） */
  icon: string
  /** 工具简介 */
  description: string
  /** 分类（用于主页分组显示） */
  category: string
  /** 懒加载的组件 */
  component: () => Promise<Component>
}

/**
 * 工具分类接口
 */
export interface ToolCategory {
  /** 分类名称 */
  name: string
  /** 该分类下的工具列表 */
  tools: ToolDefinition[]
}
```

- [ ] **Step 2: 创建工具注册表**

```typescript
// src/tools/registry.ts

import type { ToolDefinition, ToolCategory } from '@/types/tool'

/**
 * 所有已注册的工具列表
 */
export const tools: ToolDefinition[] = [
  {
    id: 'json-formatter',
    name: 'JSON格式化',
    path: '/json-formatter',
    icon: '{ }',
    description: 'JSON美化、压缩、转义',
    category: '数据处理',
    component: () => import('./json-formatter/JsonFormatter.vue')
  },
  {
    id: 'timestamp-converter',
    name: '时间戳转换',
    path: '/timestamp-converter',
    icon: '⏱',
    description: '时间戳与日期互转',
    category: '时间日期',
    component: () => import('./timestamp-converter/TimestampConverter.vue')
  }
]

/**
 * 获取按分类分组的工具列表
 */
export function getToolsByCategory(): ToolCategory[] {
  const categoryMap = new Map<string, ToolDefinition[]>()

  for (const tool of tools) {
    const existing = categoryMap.get(tool.category) || []
    existing.push(tool)
    categoryMap.set(tool.category, existing)
  }

  return Array.from(categoryMap.entries()).map(([name, tools]) => ({
    name,
    tools
  }))
}

/**
 * 根据路径查找工具
 */
export function findToolByPath(path: string): ToolDefinition | undefined {
  return tools.find(tool => tool.path === path)
}
```

- [ ] **Step 3: 创建占位组件**

```vue
<!-- src/tools/json-formatter/JsonFormatter.vue -->
<template>
  <div class="tool-placeholder">
    <h2>JSON格式化工具</h2>
    <p>功能开发中...</p>
  </div>
</template>

<script setup lang="ts">
// JSON格式化工具 - 占位组件
</script>

<style scoped>
.tool-placeholder {
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}
</style>
```

```vue
<!-- src/tools/timestamp-converter/TimestampConverter.vue -->
<template>
  <div class="tool-placeholder">
    <h2>时间戳转换工具</h2>
    <p>功能开发中...</p>
  </div>
</template>

<script setup lang="ts">
// 时间戳转换工具 - 占位组件
</script>

<style scoped>
.tool-placeholder {
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}
</style>
```

- [ ] **Step 4: 验证类型检查**

```bash
npm run build
```

Expected: TypeScript 编译通过，无类型错误

- [ ] **Step 5: Git 提交**

```bash
git add src/types/tool.ts src/tools/registry.ts src/tools/json-formatter/JsonFormatter.vue src/tools/timestamp-converter/TimestampConverter.vue
git commit -m "feat: 添加工具类型定义和注册机制"
```

---

## Task 4: 路由配置

**Files:**
- Create: `src/router/index.ts`

- [ ] **Step 1: 创建路由配置**

```typescript
// src/router/index.ts

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { tools } from '@/tools/registry'

/**
 * 基础路由配置
 */
const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue')
  }
]

/**
 * 从工具注册表动态生成路由
 */
const toolRoutes: RouteRecordRaw[] = tools.map(tool => ({
  path: tool.path,
  name: tool.id,
  component: tool.component
}))

/**
 * 合并所有路由
 */
const routes: RouteRecordRaw[] = [...baseRoutes, ...toolRoutes]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

- [ ] **Step 2: 创建占位 HomePage**

```vue
<!-- src/pages/HomePage.vue -->
<template>
  <div class="home-page">
    <h1>DevTools 开发者工具箱</h1>
    <p>主页面开发中...</p>
  </div>
</template>

<script setup lang="ts">
// 主页面 - 占位组件
</script>

<style scoped>
.home-page {
  padding: var(--spacing-lg);
}

h1 {
  color: var(--text-accent);
  margin-bottom: var(--spacing-md);
}
</style>
```

- [ ] **Step 3: 更新 App.vue 使用 router-view**

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App 根组件
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
```

- [ ] **Step 4: 验证路由**

```bash
npm run dev
```

Expected: 
- 访问 `/` 显示主页占位内容
- 访问 `/json-formatter` 显示 JSON工具占位内容
- 访问 `/timestamp-converter` 显示时间戳工具占位内容

- [ ] **Step 5: Git 提交**

```bash
git add src/router/index.ts src/pages/HomePage.vue src/App.vue
git commit -m "feat: 添加路由配置和动态工具路由"
```

---

## Task 5: 布局组件

**Files:**
- Create: `src/components/layout/AppHeader.vue`
- Create: `src/components/layout/AppSidebar.vue`
- Create: `src/components/layout/AppLayout.vue`

- [ ] **Step 1: 创建 AppHeader 组件**

```vue
<!-- src/components/layout/AppHeader.vue -->
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
```

- [ ] **Step 2: 创建 AppSidebar 组件**

```vue
<!-- src/components/layout/AppSidebar.vue -->
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
```

- [ ] **Step 3: 创建 AppLayout 组件**

```vue
<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>
```

- [ ] **Step 4: 更新 App.vue 使用布局组件**

```vue
<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>
```

- [ ] **Step 5: 验证布局**

```bash
npm run dev
```

Expected: 页面显示顶部导航栏、左侧边栏（包含工具列表）、右侧主内容区

- [ ] **Step 6: Git 提交**

```bash
git add src/components/layout/
git commit -m "feat: 添加布局组件（Header、Sidebar、Layout）"
```

---

## Task 6: 主页面开发

**Files:**
- Create: `src/components/common/ToolCard.vue`
- Modify: `src/pages/HomePage.vue`

- [ ] **Step 1: 创建 ToolCard 组件**

```vue
<!-- src/components/common/ToolCard.vue -->
<template>
  <router-link :to="tool.path" class="tool-card">
    <div class="card-icon">{{ tool.icon }}</div>
    <div class="card-content">
      <div class="card-name">{{ tool.name }}</div>
      <div class="card-desc">{{ tool.description }}</div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { ToolDefinition } from '@/types/tool'

defineProps<{
  tool: ToolDefinition
}>()
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 160px;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tool-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-decoration: none;
}

.card-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
  color: var(--text-accent);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}
</style>
```

- [ ] **Step 2: 实现 HomePage 组件**

```vue
<!-- src/pages/HomePage.vue -->
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
```

- [ ] **Step 3: 验证主页面**

```bash
npm run dev
```

Expected: 
- 主页显示标题和副标题
- 按分类显示工具卡片
- 点击卡片跳转到对应工具页面
- 悬停卡片有边框高亮和上浮效果

- [ ] **Step 4: Git 提交**

```bash
git add src/components/common/ToolCard.vue src/pages/HomePage.vue
git commit -m "feat: 实现主页面和工具卡片组件"
```

---

## Task 7: 最终验证和优化

- [ ] **Step 1: 运行构建检查**

```bash
npm run build
```

Expected: 构建成功，无错误

- [ ] **Step 2: 检查所有页面**

访问以下页面确认功能正常：
- `/` - 主页，显示工具卡片列表
- `/json-formatter` - JSON工具占位页
- `/timestamp-converter` - 时间戳工具占位页

- [ ] **Step 3: 检查响应式**

在浏览器中调整窗口大小，确认：
- 宽屏：工具卡片多列显示
- 窄屏：工具卡片单列居中显示

- [ ] **Step 4: 创建变更记录**

```markdown
# 变更记录 - 2026-03-20

## 变更类型
- [x] 新增功能

## 变更描述
完成 DevTools 项目基础搭建，包含：
- Vite + Vue 3 + TypeScript 项目初始化
- 暗色主题样式系统
- 工具注册机制（registry.ts）
- Vue Router 4 路由配置（支持动态工具路由）
- 布局组件（Header、Sidebar、Layout）
- 主页面（工具卡片列表）

## 变更原因
项目初始化，搭建基础架构以便后续开发具体工具功能

## 影响范围
- 新增文件：15个
- 影响模块：全部
- 需要更新文档：否（已是最新）
- 需要更新测试：后续添加

## 相关文档
- 产品文档：docs/specs/2026-03-20-devtools-design.md (v1.1)
```

- [ ] **Step 5: 最终提交**

```bash
git add .
git commit -m "feat: 完成阶段一基础搭建

- Vite + Vue 3 + TypeScript 项目初始化
- 暗色主题样式系统
- 工具注册机制和动态路由
- 布局组件（Header、Sidebar、Layout）
- 主页面工具卡片列表

产品文档: docs/specs/2026-03-20-devtools-design.md v1.1"
```

---

## 阶段一完成检查清单

- [ ] 项目可以正常启动 (`npm run dev`)
- [ ] 构建可以正常完成 (`npm run build`)
- [ ] 暗色主题样式生效
- [ ] 主页显示工具卡片列表
- [ ] 点击卡片可以跳转到工具页面
- [ ] 侧边栏显示工具列表并高亮当前页面
- [ ] 响应式布局正常
- [ ] 所有代码已提交

---

*计划结束*
