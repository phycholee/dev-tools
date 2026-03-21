import type { ToolDefinition, ToolCategory } from '../types/tool'

/**
 * 所有已注册的工具列表
 */
export const tools: ToolDefinition[] = [
  {
    id: 'json-formatter',
    name: 'JSON格式化',
    path: '/json-formatter',
    icon: '{ }',
    description: 'JSON美化、转义',
    category: '数据处理',
    component: () => import('./json-formatter/JsonFormatter.vue'),
    color: '#6366f1' // 靛蓝紫
  },
  {
    id: 'timestamp-converter',
    name: '时间戳转换',
    path: '/timestamp-converter',
    icon: '⏱',
    description: '时间戳与日期互转',
    category: '时间日期',
    component: () => import('./timestamp-converter/TimestampConverter.vue'),
    color: '#06b6d4' // 青色
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
