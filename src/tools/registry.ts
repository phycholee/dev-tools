import type { ToolDefinition, ToolCategory } from '../types/tool'

/**
 * 所有已注册的工具列表
 * 
 * 颜色现在通过 CSS 变量管理，定义在 globals.css 中：
 * - --tool-json: JSON 格式化工具颜色
 * - --tool-timestamp: 时间戳转换工具颜色
 * - --tool-url: URL 编解码工具颜色
 * - --tool-cron: Cron 解析工具颜色
 * 
 * ToolCard 组件根据工具 ID 自动应用对应的颜色类
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
    // 颜色通过 CSS 变量 --tool-json 管理
  },
  {
    id: 'timestamp-converter',
    name: '时间戳转换',
    path: '/timestamp-converter',
    icon: '⏱',
    description: '时间戳与日期互转',
    category: '时间日期',
    component: () => import('./timestamp-converter/TimestampConverter.vue'),
    // 颜色通过 CSS 变量 --tool-timestamp 管理
  },
  {
    id: 'url-codec',
    name: 'URL编解码',
    path: '/url-codec',
    icon: '🔗',
    description: 'URL编码与解码',
    category: '编解码',
    component: () => import('./url-codec/UrlCodec.vue'),
    // 颜色通过 CSS 变量 --tool-url 管理
  },
  {
    id: 'cron-parser',
    name: 'Cron解析',
    path: '/cron-parser',
    icon: '⏰',
    description: 'Cron表达式解析与可视化',
    category: '开发辅助',
    component: () => import('./cron-parser/CronParser.vue'),
    // 颜色通过 CSS 变量 --tool-cron 管理
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
