import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import type { ToolDefinition } from '../types/tool'
import { tools } from '../tools/registry'

/**
 * 基础路由配置
 */
const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue')
  }
]

/**
 * 从工具注册表动态生成路由
 */
const toolRoutes: RouteRecordRaw[] = tools.map((tool: ToolDefinition) => ({
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
