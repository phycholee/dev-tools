import type { ToolDefinition } from '../types/tool'

type ToolCategory = {
  name: string
  tools: ToolDefinition[]
}

// Simple in-memory registry for demo purposes
export const tools: ToolDefinition[] = [
  {
    id: 'tool-echo',
    name: 'Echo Tool',
    path: '/tools/echo',
    icon: '🗂️',
    description: 'Echo a message to the console',
    component: () => import('../components/tools/ToolEcho.vue'),
  },
  {
    id: 'tool-lint',
    name: 'Lint Checker',
    path: '/tools/lint',
    icon: '🧹',
    description: 'Run lint checks on codebase',
    component: () => import('../components/tools/ToolLint.vue'),
  },
  {
    id: 'tool-trace',
    name: 'Tracer',
    path: '/tools/trace',
    icon: '🔎',
    description: 'Trace execution flow',
    component: () => import('../components/tools/ToolTrace.vue'),
  },
]
export function getToolsByCategory(): ToolCategory[] {
  const categoryData: ToolCategory[] = [
    {
      name: '常用工具',
      tools: tools,
    },
    {
      name: '调试工具',
      tools: [],
    },
  ]
  return categoryData
}
