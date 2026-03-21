# shadcn-vue UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the current custom CSS-based UI to shadcn-vue component library with Tailwind CSS, achieving Vercel/Geist-style design.

**Architecture:** Install Tailwind CSS + shadcn-vue, map existing design tokens to shadcn-vue theme variables, replace custom components with shadcn-vue equivalents (Card, Button, Badge), keep existing tool registry and routing mechanism unchanged.

**Tech Stack:** Vue 3.x, Vite 5.x, TypeScript 5.x, Tailwind CSS 4.x, shadcn-vue, Radix Vue

---

## Phase 1: Infrastructure Setup

### Task 1: Install Tailwind CSS + shadcn-vue dependencies

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`

- [ ] **Step 1: Install Tailwind CSS core packages**

```bash
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
```

- [ ] **Step 2: Install shadcn-vue dependencies**

```bash
npm install radix-vue class-variance-authority clsx tailwind-merge lucide-vue-next
```

- [ ] **Step 3: Create postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: Update vite.config.ts to use @tailwindcss/vite**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

- [ ] **Step 5: Verify dev server starts without errors**

```bash
npm run dev
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts postcss.config.js
git commit -m "chore: install Tailwind CSS and shadcn-vue dependencies"
```

---

### Task 2: Create shadcn-vue configuration and CSS variables

**Files:**
- Create: `components.json`
- Create: `src/assets/styles/globals.css`

- [ ] **Step 1: Create components.json (shadcn-vue config)**

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tsconfig": "tsconfig.json",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/assets/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

- [ ] **Step 2: Create src/lib/utils.ts**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Create src/assets/styles/globals.css**

Map current design tokens to shadcn-vue CSS variables. The current theme uses:
- Backgrounds: #0d0d0f, #141418, #1a1a20, #222228
- Text: #e8e8ed, #888890, #5a5a62, #6366f1 (accent)
- Accent: #6366f1 (indigo), #8b5cf6 (violet)
- Fonts: Inter, JetBrains Mono

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn-vue base variables */
    --background: 0 0% 5%;        /* #0d0d0f */
    --foreground: 0 0% 91%;       /* #e8e8ed */
    
    --card: 0 0% 8.6%;            /* #16161c */
    --card-foreground: 0 0% 91%;
    
    --popover: 0 0% 8.6%;
    --popover-foreground: 0 0% 91%;
    
    --primary: 239 84% 67%;       /* #6366f1 */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 0 0% 10%;        /* #1a1a20 */
    --secondary-foreground: 0 0% 91%;
    
    --muted: 0 0% 13.3%;          /* #222228 */
    --muted-foreground: 0 0% 53%; /* #888890 */
    
    --accent: 0 0% 13.3%;
    --accent-foreground: 0 0% 91%;
    
    --destructive: 0 84% 60%;     /* #ef4444 */
    --destructive-foreground: 0 0% 98%;
    
    --border: 0 0% 16.5%;         /* #2a2a32 */
    --input: 0 0% 16.5%;
    --ring: 239 84% 67%;
    
    --radius: 0.625rem;           /* 10px */
    
    /* Custom extension variables */
    --bg-primary: #0d0d0f;
    --bg-secondary: #141418;
    --bg-tertiary: #1a1a20;
    --bg-hover: #222228;
    --bg-card: #16161c;
    
    --text-primary: #e8e8ed;
    --text-secondary: #888890;
    --text-tertiary: #5a5a62;
    --text-accent: #6366f1;
    
    --accent-primary: #6366f1;
    --accent-secondary: #8b5cf6;
    --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    
    --border-color: #2a2a32;
    --border-subtle: #1e1e24;
    
    --success: #10b981;
    --error: #ef4444;
    --warning: #f59e0b;
    --info: #3b82f6;
    
    --glow-accent: 0 0 30px rgba(99, 102, 241, 0.15);
    --glow-accent-strong: 0 0 40px rgba(99, 102, 241, 0.25);
    
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    --spacing-3xl: 64px;
    
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
    
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 4: Update tailwind.config.js with current theme colors**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: 0, transform: 'translateX(-10px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out backwards',
        slideInLeft: 'slideInLeft 0.3s ease-out backwards',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Verify CSS compiles without errors**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add components.json src/lib/utils.ts src/assets/styles/globals.css tailwind.config.js
git commit -m "feat: add shadcn-vue config and CSS variables (Vercel dark theme)"
```

---

### Task 3: Update entry points to use globals.css

**Files:**
- Modify: `src/main.ts`
- Modify: `src/App.vue`

- [ ] **Step 1: Update main.ts to import globals.css instead of main.css**

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/globals.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

- [ ] **Step 2: Remove main.css import from App.vue (already removed in Step 1)**

No changes needed in App.vue for this step.

- [ ] **Step 3: Verify page renders with new styles**

```bash
npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/main.ts
git commit -m "refactor: switch to globals.css for Tailwind/shadcn-vue"
```

---

## Phase 2: shadcn-vue Components Installation

### Task 4: Install core shadcn-vue components via CLI

**Files:**
- Create: `src/components/ui/*` (generated by CLI)

- [ ] **Step 1: Add Card component**

```bash
npx shadcn-vue@latest add card
```

- [ ] **Step 2: Add Button component**

```bash
npx shadcn-vue@latest add button
```

- [ ] **Step 3: Add Badge component**

```bash
npx shadcn-vue@latest add badge
```

- [ ] **Step 4: Verify all components installed correctly**

```bash
ls src/components/ui/
```

Expected: card/, button/, badge/ directories with index.ts files.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: install shadcn-vue Card, Button, Badge components"
```

---

## Phase 3: Component Migration

### Task 5: Migrate ToolCard to use shadcn-vue Card

**Files:**
- Modify: `src/components/common/ToolCard.vue`

- [ ] **Step 1: Rewrite ToolCard using shadcn-vue Card component**

```vue
<template>
  <router-link :to="tool.path" class="block group">
    <Card
      class="relative overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/30"
      :style="{ '--tool-color': tool.color || '#6366f1' }"
    >
      <!-- Left accent bar -->
      <div
        class="absolute top-4 bottom-4 left-0 w-1.5 rounded-r transition-all duration-250 group-hover:w-2"
        :style="{ background: `linear-gradient(180deg, ${tool.color || '#6366f1'} 0%, ${tool.color || '#6366f1'}60 100%)` }"
      />
      
      <!-- Bottom glow -->
      <div
        class="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 transition-all duration-250 group-hover:opacity-70 group-hover:h-1"
        :style="{ background: `linear-gradient(90deg, transparent 0%, ${tool.color || '#6366f1'} 20%, ${tool.color || '#6366f1'} 80%, transparent 100%)` }"
      />

      <CardContent class="flex items-center gap-5 p-6 pl-8">
        <!-- Icon -->
        <div
          class="flex items-center justify-center w-16 h-16 rounded-xl shrink-0 transition-all duration-250 border group-hover:scale-105"
          :style="{
            background: `color-mix(in srgb, ${tool.color || '#6366f1'} 15%, var(--bg-tertiary))`,
            borderColor: `color-mix(in srgb, ${tool.color || '#6366f1'} 20%, transparent)`
          }"
        >
          <span
            class="text-2xl transition-all duration-250"
            :style="{ color: tool.color || '#6366f1' }"
          >
            {{ tool.icon }}
          </span>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-1">
          <div class="text-xl font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
            {{ tool.name }}
          </div>
          <div class="text-sm text-muted-foreground leading-relaxed">
            {{ tool.description }}
          </div>
        </div>
      </CardContent>
    </Card>
  </router-link>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import type { ToolDefinition } from '../../types/tool'

defineProps<{
  tool: ToolDefinition
}>()
</script>
```

- [ ] **Step 2: Verify card renders correctly in browser**

```bash
npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add src/components/common/ToolCard.vue
git commit -m "refactor(ToolCard): migrate to shadcn-vue Card component"
```

---

### Task 6: Migrate AppHeader to use shadcn-vue Button + Badge

**Files:**
- Modify: `src/components/layout/AppHeader.vue`

- [ ] **Step 1: Rewrite AppHeader using shadcn-vue components**

```vue
<template>
  <header class="bg-secondary border-b border-border/50 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-6xl mx-auto px-8 py-6">
      <div class="flex items-center gap-3 cursor-pointer select-none" @click="goHome">
        <!-- Logo icon -->
        <div class="flex items-center justify-center text-primary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
            DevTools
          </span>
          <span class="text-xs text-muted-foreground font-medium tracking-wide">
            开发者工具箱
          </span>
        </div>
      </div>
      
      <Badge variant="secondary" class="font-mono text-xs">
        v0.1.0
      </Badge>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>
```

- [ ] **Step 2: Verify header renders correctly**

```bash
npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppHeader.vue
git commit -m "refactor(AppHeader): migrate to shadcn-vue Badge component"
```

---

### Task 7: Migrate AppSidebar to Tailwind CSS (no shadcn-vue component needed)

**Files:**
- Modify: `src/components/layout/AppSidebar.vue`

- [ ] **Step 1: Rewrite AppSidebar using Tailwind CSS utilities**

The sidebar uses custom CSS for category labels, nav items, and active indicators. Convert to Tailwind:

```vue
<template>
  <aside class="w-60 h-full bg-secondary border-r border-border/50 overflow-y-auto py-6">
    <nav class="flex flex-col gap-6">
      <div
        v-for="(category, index) in toolCategories"
        :key="category.name"
        class="animate-slideInLeft"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- Category label -->
        <div class="px-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {{ category.name }}
        </div>
        
        <!-- Category items -->
        <div class="flex flex-col gap-0.5 px-2">
          <router-link
            v-for="tool in category.tools"
            :key="tool.id"
            :to="tool.path"
            class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            :class="{ 'bg-primary/10 text-primary': isActive(tool.path) }"
          >
            <!-- Active indicator -->
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r bg-primary transition-all duration-250"
              :class="isActive(tool.path) ? 'h-4' : 'h-0'"
            />
            
            <span class="w-5 text-center text-sm shrink-0">
              {{ tool.icon }}
            </span>
            <span class="text-sm font-medium truncate">
              {{ tool.name }}
            </span>
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
```

- [ ] **Step 2: Verify sidebar renders correctly**

```bash
npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppSidebar.vue
git commit -m "refactor(AppSidebar): migrate to Tailwind CSS utilities"
```

---

### Task 8: Migrate AppLayout to Tailwind CSS

**Files:**
- Modify: `src/components/layout/AppLayout.vue`

- [ ] **Step 1: Rewrite AppLayout using Tailwind CSS**

```vue
<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    <main class="flex-1 bg-background">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>
```

- [ ] **Step 2: Verify layout renders correctly**

```bash
npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppLayout.vue
git commit -m "refactor(AppLayout): migrate to Tailwind CSS utilities"
```

---

### Task 9: Migrate HomePage to Tailwind CSS

**Files:**
- Modify: `src/pages/HomePage.vue`

- [ ] **Step 1: Rewrite HomePage using Tailwind CSS**

```vue
<template>
  <div class="py-16 px-24 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ToolCard
        v-for="(tool, index) in allTools"
        :key="tool.id"
        :tool="tool"
        class="animate-fadeIn"
        :style="{ animationDelay: `${index * 80}ms` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { tools } from '../tools/registry'
import ToolCard from '../components/common/ToolCard.vue'

const allTools = tools
</script>
```

- [ ] **Step 2: Verify homepage grid renders correctly**

```bash
npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.vue
git commit -m "refactor(HomePage): migrate to Tailwind CSS grid layout"
```

---

## Phase 4: Cleanup

### Task 10: Remove old CSS file and verify build

**Files:**
- Delete: `src/assets/styles/main.css`
- Verify: `npm run build` passes

- [ ] **Step 1: Delete main.css**

```bash
rm src/assets/styles/main.css
```

- [ ] **Step 2: Verify no remaining imports of main.css**

Search codebase for "main.css" references.

- [ ] **Step 3: Run build to verify**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Run dev server for final visual check**

```bash
npm run dev
```

Check:
- [ ] Header renders with correct styling
- [ ] Sidebar navigation works (active states)
- [ ] ToolCard hover effects work
- [ ] Dark mode colors match Vercel style
- [ ] Responsive layout (resize browser)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old CSS file, complete shadcn-vue migration"
```

---

### Task 11: Update documentation

**Files:**
- Modify: `docs/specs/2026-03-20-devtools-design.md` (bump to v1.2)
- Modify: `docs/memory/PROJECT_MEMORY.md`
- Create: `docs/changelog/2026-03-21-shadcn-vue-migration.md`

- [ ] **Step 1: Create changelog entry**

```markdown
# 变更记录 - 2026-03-21

## 变更类型
- [x] 重构

## 变更描述
UI 框架从纯 CSS Variables 迁移到 shadcn-vue + Tailwind CSS，采用 Vercel/Geist 风格设计系统。

## 变更原因
- 统一组件库，减少自定义 CSS 维护成本
- 获得高质量、可访问的 UI 组件
- 支持更灵活的主题定制（shadcn-vue CSS 变量体系）
- 为后续功能开发（JSON格式化、时间戳转换）提供更好的 UI 基础

## 影响范围
- 影响的文件/模块：所有布局组件（AppHeader、AppSidebar、AppLayout）、ToolCard、HomePage、全局样式
- 是否需要更新文档：是（产品文档版本号更新）
- 是否需要更新测试：否（无单元测试）

## 相关文档
- 产品文档：docs/specs/2026-03-20-devtools-design.md (v1.2)
```

- [ ] **Step 2: Update product design doc version**

Change header from v1.1 to v1.2.

- [ ] **Step 3: Update PROJECT_MEMORY.md**

- Add new key decision: "UI框架：shadcn-vue + Tailwind CSS（替代纯 CSS Variables）"
- Update project structure with new files (components/ui/, lib/utils.ts, globals.css)
- Mark this task as completed in progress section

- [ ] **Step 4: Commit**

```bash
git add docs/
git commit -m "docs: update changelog and product doc for shadcn-vue migration"
```

---

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `components.json` | shadcn-vue configuration |
| `tailwind.config.js` | Tailwind CSS config with shadcn-vue theme |
| `postcss.config.js` | PostCSS config for Tailwind |
| `src/lib/utils.ts` | shadcn-vue utility function (`cn()`) |
| `src/assets/styles/globals.css` | Tailwind + shadcn-vue CSS variables |
| `src/components/ui/*` | shadcn-vue components (generated by CLI) |

### Modified Files
| File | Changes |
|------|---------|
| `package.json` | New dependencies |
| `vite.config.ts` | Add Tailwind Vite plugin |
| `src/main.ts` | Import globals.css instead of main.css |
| `src/components/common/ToolCard.vue` | Rewrite with shadcn-vue Card |
| `src/components/layout/AppHeader.vue` | Rewrite with Tailwind + Badge |
| `src/components/layout/AppSidebar.vue` | Rewrite with Tailwind |
| `src/components/layout/AppLayout.vue` | Rewrite with Tailwind |
| `src/pages/HomePage.vue` | Rewrite with Tailwind grid |

### Deleted Files
| File | Reason |
|------|--------|
| `src/assets/styles/main.css` | Replaced by globals.css |

---

## Execution Options

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
