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
  /** 图标（emoji 字符串 或 Lucide 组件） */
  icon: string | Component
  /** 工具简介 */
  description: string
  /** 分类（用于主页分组显示） */
  category: string
  /** 懒加载的组件 */
  component: () => Promise<Component>
  /** 主题色（用于卡片装饰） */
  color?: string
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
