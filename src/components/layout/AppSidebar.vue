<template>
  <aside class="w-60 h-full bg-secondary border-r border-border/50 overflow-y-auto py-6" aria-label="工具导航">
    <nav class="flex flex-col gap-6" aria-label="工具列表">
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
            :aria-current="isActive(tool.path) ? 'page' : undefined"
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
