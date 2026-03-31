# 正则表达式测试工具设计文档

## 概述

正则表达式测试工具是DevTools开发者工具箱的新工具，用于正则表达式的编写、测试和调试。支持实时匹配高亮、替换操作、常用模板快速填充、正则解释和语法检查。

## 需求分析

### 功能需求

1. **正则匹配**：实时高亮显示匹配结果
   - 支持标志位：`g`(全局)、`i`(忽略大小写)、`m`(多行)、`s`(点号匹配换行)、`u`(Unicode)
   - 实时更新，输入即匹配

2. **替换功能**：支持正则替换操作
   - 替换输入框实时预览替换结果
   - 支持捕获组引用（$1, $2...）

3. **常用正则模板**：内置常用正则表达式
   - 邮箱、手机号、URL、IP地址、日期、中文等
   - 下拉选择快速填充到输入框

4. **正则表达式解释**：将正则分解为可读解释
   - 逐段解释每个正则组成部分
   - 帮助理解复杂正则

5. **实时语法检查**：输入时检查正则语法
   - 错误时显示红色提示和错误信息
   - 正确时无干扰

### 非功能需求
- 界面风格与现有工具保持一致（暗色主题、Tailwind CSS）
- 操作简单直观
- 错误处理清晰
- 支持复制到剪贴板
- 响应式布局

## 设计方案

### 选择方案：Overlay高亮编辑器

**核心思路**：使用双层叠加实现原位高亮
- 底层 `<textarea>`：接收用户输入，文字设为透明
- 顶层 `<div>`：根据匹配结果渲染高亮色块
- 两层完全对齐，滚动同步

**优势**：
- 所见即所得，匹配位置一目了然
- 用户体验优于独立结果面板

**布局结构**（上下布局）：
```
┌─────────────────────────────────────────┐
│  🔤 正则表达式测试                        │
├─────────────────────────────────────────┤
│  正则输入区                               │
│  /____________/  [g][i][m][s][u]  [模板▼]│
│  ⚠ 语法错误提示                          │
├─────────────────────────────────────────┤
│  测试文本（带原位高亮）                    │
│  ┌─────────────────────────────────────┐ │
│  │ Hello 123 World 456                │ │
│  │     ███         ███  ← 高亮匹配     │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  替换区                                   │
│  替换为: [________________]              │
│  替换结果: Hello *** World ***          │
├─────────────────────────────────────────┤
│  信息区                                   │
│  匹配数: 2  │  正则解释: ...             │
└─────────────────────────────────────────┘
```

## 技术设计

### 目录结构
```
src/tools/regex-tester/
├── RegexTester.vue      # 主组件
├── RegexHighlight.vue   # 高亮编辑器组件
├── regex.ts             # 核心逻辑（匹配、替换、解释）
└── templates.ts         # 常用正则模板
```

### 工具注册
在`src/tools/registry.ts`中添加：
```typescript
{
  id: 'regex-tester',
  name: '正则测试',
  path: '/regex-tester',
  icon: '🔤',
  description: '正则表达式匹配、替换、高亮',
  category: '开发辅助',
  component: () => import('./regex-tester/RegexTester.vue'),
  color: '#8b5cf6' // 紫罗兰色
}
```

### 接口定义

```typescript
// regex.ts

/**
 * 正则匹配结果
 */
export interface RegexMatchResult {
  success: boolean
  matches: MatchItem[]
  error?: string
}

/**
 * 单个匹配项
 */
export interface MatchItem {
  value: string       // 匹配的文本
  index: number       // 匹配起始位置
  length: number      // 匹配长度
  groups?: string[]   // 捕获组
}

/**
 * 替换结果
 */
export interface RegexReplaceResult {
  success: boolean
  output: string
  error?: string
}

/**
 * 正则解释结果
 */
export interface RegexExplanation {
  success: boolean
  parts: RegexPart[]
  error?: string
}

/**
 * 正则组成部分
 */
export interface RegexPart {
  pattern: string     // 原始模式
  description: string // 中文解释
}

/**
 * 正则语法检查结果
 */
export interface RegexValidation {
  valid: boolean
  error?: string
}
```

### 核心函数

```typescript
// regex.ts

/**
 * 验证正则表达式语法
 * @param pattern - 正则表达式字符串
 * @param flags - 标志位
 * @returns 验证结果
 */
export function validateRegex(pattern: string, flags: string): RegexValidation

/**
 * 执行正则匹配
 * @param text - 测试文本
 * @param pattern - 正则表达式
 * @param flags - 标志位
 * @returns 匹配结果
 */
export function matchRegex(text: string, pattern: string, flags: string): RegexMatchResult

/**
 * 执行正则替换
 * @param text - 测试文本
 * @param pattern - 正则表达式
 * @param replacement - 替换文本
 * @param flags - 标志位
 * @returns 替换结果
 */
export function replaceRegex(
  text: string,
  pattern: string,
  replacement: string,
  flags: string
): RegexReplaceResult

/**
 * 解释正则表达式
 * @param pattern - 正则表达式
 * @returns 解释结果
 */
export function explainRegex(pattern: string): RegexExplanation
```

### 常用正则模板

```typescript
// templates.ts

export interface RegexTemplate {
  name: string        // 模板名称
  pattern: string     // 正则表达式
  flags: string       // 默认标志位
  description: string // 说明
  example: string     // 示例文本
}

export const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    name: '邮箱地址',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: '匹配标准邮箱地址格式',
    example: 'test@example.com'
  },
  {
    name: '手机号 (中国)',
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
    description: '匹配中国大陆11位手机号',
    example: '13812345678'
  },
  {
    name: 'URL',
    pattern: 'https?://[^\\s]+',
    flags: 'g',
    description: '匹配HTTP/HTTPS链接',
    example: 'https://example.com/path'
  },
  {
    name: 'IP地址 (IPv4)',
    pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
    flags: 'g',
    description: '匹配IPv4地址',
    example: '192.168.1.1'
  },
  {
    name: '日期 (YYYY-MM-DD)',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    description: '匹配日期格式 YYYY-MM-DD',
    example: '2026-03-31'
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    flags: 'g',
    description: '匹配中文字符',
    example: '你好世界'
  },
  {
    name: 'HTML标签',
    pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>',
    flags: 'g',
    description: '匹配成对的HTML标签',
    example: '<div>内容</div>'
  },
  {
    name: '十六进制颜色',
    pattern: '#[0-9a-fA-F]{6}\\b',
    flags: 'g',
    description: '匹配6位十六进制颜色代码',
    example: '#ff5733'
  }
]
```

### 高亮编辑器组件

```vue
<!-- RegexHighlight.vue -->
<template>
  <div class="relative w-full h-full">
    <!-- 高亮层 -->
    <div
      ref="highlightRef"
      class="absolute inset-0 p-3 font-mono text-sm whitespace-pre-wrap break-words overflow-auto pointer-events-none"
      aria-hidden="true"
    >
      <span
        v-for="(segment, i) in segments"
        :key="i"
        :class="segment.isMatch ? 'bg-primary/30 rounded-sm' : ''"
      >{{ segment.text }}</span>
    </div>

    <!-- 输入层 -->
    <textarea
      ref="textareaRef"
      v-model="localValue"
      :placeholder="placeholder"
      class="relative w-full h-full p-3 font-mono text-sm bg-transparent border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground text-transparent caret-foreground"
      @scroll="syncScroll"
      @input="handleInput"
    />
  </div>
</template>
```

**关键实现细节**：
- `segments`：将文本按匹配位置分割为 `{ text, isMatch }[]`
- `syncScroll`：textarea 滚动时同步 highlight 层位置
- `caret-foreground`：光标颜色设为前景色，保证可见

### 正则解释实现

解释引擎将正则分解为可识别的组成部分：

| 模式 | 解释 |
|------|------|
| `^` | 字符串开头 |
| `$` | 字符串结尾 |
| `.` | 任意字符（除换行符） |
| `\d` | 数字 [0-9] |
| `\w` | 单词字符 [a-zA-Z0-9_] |
| `\s` | 空白字符 |
| `[abc]` | 字符集合 |
| `[^abc]` | 否定字符集合 |
| `a|b` | 或运算 |
| `*` | 0次或多次 |
| `+` | 1次或多次 |
| `?` | 0次或1次 |
| `{n}` | 恰好n次 |
| `{n,m}` | n到m次 |
| `(abc)` | 捕获组 |
| `(?:abc)` | 非捕获组 |

## 错误处理

### 错误类型
1. **无效正则语法**：输入的正则表达式语法错误
2. **空正则**：未输入正则表达式
3. **空文本**：未输入测试文本
4. **替换错误**：替换过程中出现问题

### 边界情况
1. **空匹配**：正则匹配到空字符串时的处理
2. **超长文本**：大文本量时的性能考虑
3. **复杂正则**：可能导致回溯爆炸的正则（如`(a+)+`）
4. **Unicode**：正确处理多字节字符的索引位置

### 用户体验
- **实时反馈**：输入时立即检查语法并显示错误
- **错误定位**：尽可能指出错误位置
- **性能保护**：超时保护，防止复杂正则导致页面卡死
- **复制反馈**：操作成功后toast提示

## UI设计

### 组件状态
```typescript
// RegexTester.vue
const pattern = ref('')           // 正则表达式
const flags = ref('g')            // 标志位
const testText = ref('')          // 测试文本
const replacement = ref('')       // 替换文本
const selectedTemplate = ref<string | null>(null)

// 计算结果
const validation = computed(() => validateRegex(pattern.value, flags.value))
const matchResult = computed(() => matchRegex(testText.value, pattern.value, flags.value))
const replaceResult = computed(() => replaceRegex(testText.value, pattern.value, replacement.value, flags.value))
const explanation = computed(() => explainRegex(pattern.value))
```

### 标志位切换
```vue
<div class="flex items-center gap-1">
  <Button
    v-for="flag in availableFlags"
    :key="flag.value"
    @click="toggleFlag(flag.value)"
    :variant="flags.includes(flag.value) ? 'default' : 'outline'"
    size="sm"
    class="w-8 h-8"
  >
    {{ flag.label }}
  </Button>
</div>
```

### 匹配信息展示
```vue
<div class="flex items-center gap-4 text-sm text-muted-foreground">
  <span>匹配数: <strong class="text-foreground">{{ matchResult.matches.length }}</strong></span>
  <span v-if="matchResult.matches[0]?.groups?.length">
    捕获组: <strong class="text-foreground">{{ matchResult.matches[0].groups.length }}</strong>
  </span>
</div>
```

## 测试策略

### 单元测试
1. **validateRegex**：
   - 有效正则 → `{ valid: true }`
   - 无效正则 → `{ valid: false, error: "..." }`
   - 空输入 → `{ valid: false }`

2. **matchRegex**：
   - 基本匹配
   - 全局匹配（g标志）
   - 忽略大小写（i标志）
   - 多行匹配（m标志）
   - 捕获组提取
   - 无匹配结果
   - 空文本/空正则

3. **replaceRegex**：
   - 基本替换
   - 全局替换
   - 捕获组引用（$1, $2...）
   - 空替换
   - 无匹配时返回原文

4. **explainRegex**：
   - 基本字符类解释
   - 量词解释
   - 分组解释
   - 边界解释
   - 复杂嵌套正则

### E2E测试
1. **用户操作流程**：
   - 输入正则 → 实时语法检查 → 输入测试文本 → 查看高亮匹配
   - 切换标志位 → 验证匹配结果变化
   - 选择模板 → 验证填充效果
   - 输入替换文本 → 查看替换结果

2. **错误处理**：
   - 无效正则 → 显示红色错误提示
   - 空输入 → 界面状态正确

## 实现计划

### 阶段1：工具函数实现
1. 创建`regex.ts`文件
2. 实现`validateRegex`函数
3. 实现`matchRegex`函数
4. 实现`replaceRegex`函数
5. 实现`explainRegex`函数
6. 编写单元测试

### 阶段2：模板数据
1. 创建`templates.ts`文件
2. 定义常用正则模板数据

### 阶段3：高亮编辑器
1. 创建`RegexHighlight.vue`组件
2. 实现Overlay双层叠加
3. 实现滚动同步
4. 实现高亮渲染逻辑

### 阶段4：主组件
1. 创建`RegexTester.vue`组件
2. 实现界面布局
3. 实现正则输入+标志位
4. 实现模板选择
5. 实现替换功能
6. 实现解释展示

### 阶段5：集成和测试
1. 注册工具到`registry.ts`
2. 运行单元测试
3. 运行E2E测试
4. 修复发现的问题

## 验收标准

1. **功能完整性**：
   - ✅ 支持正则匹配实时高亮
   - ✅ 支持标志位切换（g/i/m/s/u）
   - ✅ 支持替换操作
   - ✅ 支持常用正则模板
   - ✅ 支持正则表达式解释
   - ✅ 支持实时语法检查

2. **用户体验**：
   - ✅ 界面风格与现有工具一致
   - ✅ 高亮显示匹配位置
   - ✅ 错误提示清晰
   - ✅ 支持复制到剪贴板
   - ✅ 操作响应流畅

3. **代码质量**：
   - ✅ TypeScript类型安全
   - ✅ 遵循现有代码风格
   - ✅ 通过所有测试
   - ✅ 无LSP诊断错误

## 后续扩展

1. **性能优化**：对于超大文本，使用Web Worker进行匹配计算
2. **更多模板**：持续补充常用正则模板
3. **正则可视化**：用图形化方式展示正则结构（类似regexper.com）
4. **历史记录**：保存最近使用的正则到本地存储
5. **分享功能**：生成可分享的正则测试链接
