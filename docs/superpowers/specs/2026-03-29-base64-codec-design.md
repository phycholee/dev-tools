# Base64编解码工具设计文档

## 概述

Base64编解码工具是DevTools开发者工具箱的新工具，用于Base64编码和解码操作。支持多种Base64格式变体，提供UTF-8字符集处理能力。

## 需求分析

### 功能需求
1. **编码格式支持**：全格式支持
   - 标准Base64（RFC 4648）
   - URL安全Base64（使用`-`和`_`代替`+`和`/`）
   - Base64url（RFC 4648定义的URL安全变体）

2. **输入方式**：仅文本输入
   - 用户直接在文本框中输入文本或Base64字符串
   - 不支持文件上传或拖拽

3. **字符集处理**：UTF-8编码
   - 自动将文本转换为UTF-8字节再进行Base64编码
   - 解码时自动从UTF-8字节还原为文本

### 非功能需求
- 界面风格与现有工具保持一致
- 操作简单直观
- 错误处理清晰
- 支持复制到剪贴板

## 设计方案

### 选择方案：分离式设计

**布局结构**：
1. 顶部：工具标题、图标、描述
2. 使用提示区域
3. 输入区域：文本输入框 + 操作按钮
4. 输出区域：结果显示

**操作流程**：
- 编码：输入文本 → 选择格式 → 点击编码 → 显示结果
- 解码：输入Base64文本 → 点击解码 → 自动识别格式 → 显示结果

## 技术设计

### 目录结构
```
src/tools/base64-codec/
├── Base64Codec.vue      # 主组件
└── base64.ts            # 工具函数
```

### 工具注册
在`src/tools/registry.ts`中添加：
```typescript
{
  id: 'base64-codec',
  name: 'Base64编解码',
  path: '/base64-codec',
  icon: '🔐',
  description: 'Base64编码与解码，支持多种格式',
  category: '编解码',
  component: () => import('./base64-codec/Base64Codec.vue'),
}
```

### CSS变量
在`globals.css`中添加工具颜色：
```css
/* 工具卡片颜色 */
--tool-base64: oklch(55% 0.15 280);  /* 紫色系，与编解码类别匹配 */
```

### 接口定义
```typescript
export interface Base64CodecResult {
  success: boolean
  output: string
  error?: string
}

export type Base64Format = 'standard' | 'url-safe' | 'base64url'
```

### 核心函数
```typescript
/**
 * 编码文本为Base64
 * @param input - 原始文本（UTF-8编码）
 * @param format - Base64格式
 * @returns 编码结果
 */
export function encodeBase64(input: string, format: Base64Format): Base64CodecResult

/**
 * 解码Base64文本
 * @param input - Base64编码文本
 * @returns 解码结果（自动识别格式）
 */
export function decodeBase64(input: string): Base64CodecResult
```

### 格式差异
| 格式 | 字符集 | 填充符 | 用途 |
|------|--------|--------|------|
| 标准Base64 | A-Z, a-z, 0-9, +, / | = | 通用编码 |
| URL安全Base64 | A-Z, a-z, 0-9, -, _ | = | URL参数 |
| Base64url | A-Z, a-z, 0-9, -, _ | 无或URL编码 | URL和文件名 |

### 字符集处理
- **编码**：TextEncoder → UTF-8字节 → Base64编码
- **解码**：Base64解码 → UTF-8字节 → TextDecoder

## 错误处理

### 错误类型
1. **无效Base64输入**：解码时输入不符合Base64格式
2. **空输入**：未输入任何内容
3. **格式识别失败**：无法自动识别Base64格式

### 边界情况
1. **多行文本**：将整个输入作为单个字节流处理（标准Base64行为），保留换行符作为普通字符
2. **特殊字符**：UTF-8编码处理中文、emoji等
3. **填充符**：自动处理Base64填充（=）

### 用户体验
- **实时验证**：输入时检查格式有效性
- **错误提示**：清晰显示错误原因
- **复制反馈**：操作成功后toast提示

## UI设计

### 界面布局
```vue
<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)] p-4 gap-6 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-3xl">🔐</span>
      <div>
        <h1 class="text-xl font-bold text-foreground">Base64编解码</h1>
        <p class="text-sm text-muted-foreground">Base64编码与解码工具，支持多种格式</p>
      </div>
    </div>

    <!-- Help tip -->
    <div class="p-3 bg-muted/50 rounded-lg border border-border/50">
      <div class="flex items-start gap-2">
        <span class="text-muted-foreground text-sm">💡</span>
        <div class="text-sm text-muted-foreground">
          <strong class="text-foreground">使用提示：</strong> 
          <strong>标准Base64</strong> 使用 + 和 / 字符。
          <strong>URL安全Base64</strong> 使用 - 和 _ 字符，适合URL参数。
          <span class="text-xs opacity-75 ml-2">解码时自动识别格式</span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <Card class="p-4">
      <textarea
        v-model="input"
        placeholder="输入文本或 Base64 字符串..."
        class="w-full h-32 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        aria-label="输入文本"
      />

      <!-- Format selector (for encoding) -->
      <div v-if="mode === 'encode'" class="flex items-center gap-2 mt-4">
        <span class="text-sm text-muted-foreground">格式：</span>
        <Button
          v-for="fmt in formats"
          :key="fmt.value"
          @click="format = fmt.value"
          :variant="format === fmt.value ? 'default' : 'outline'"
          size="sm"
        >
          {{ fmt.label }}
        </Button>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-3 mt-4">
        <Button @click="handleEncode" variant="default" :disabled="!input.trim()">
          编码
        </Button>
        <Button @click="handleDecode" variant="secondary" :disabled="!input.trim()">
          解码
        </Button>
        <div class="flex-1" />
        <Button @click="handleClear" variant="ghost">
          清除
        </Button>
      </div>
    </Card>

    <!-- Output -->
    <Card v-if="result" class="p-4">
      <h2 class="text-sm font-semibold text-foreground mb-3">
        {{ mode === 'encode' ? '编码结果' : '解码结果' }}
      </h2>

      <!-- Error state -->
      <div
        v-if="!result.success"
        class="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"
      >
        <span>⚠</span>
        <span>{{ result.error }}</span>
      </div>

      <!-- Success state -->
      <div
        v-else
        class="p-3 rounded-md bg-muted h-32 flex items-start justify-between gap-2 overflow-auto"
      >
        <pre class="font-mono text-sm break-all select-all whitespace-pre-wrap flex-1">{{ result.output }}</pre>
        <Button
          variant="ghost"
          size="sm"
          class="shrink-0 hover:bg-background"
          @click="copyToClipboard(result.output)"
        >
          复制
        </Button>
      </div>
    </Card>
  </div>
</template>
```

### 组件状态
```typescript
const input = ref('')
const mode = ref<'encode' | 'decode' | null>(null)
const format = ref<Base64Format>('standard')
const result = ref<Base64CodecResult | null>(null)

const formats = [
  { value: 'standard', label: '标准Base64' },
  { value: 'url-safe', label: 'URL安全' },
  { value: 'base64url', label: 'Base64url' },
]
```

## 测试策略

### 单元测试
1. **编码测试**：
   - 英文文本编码
   - 中文文本编码（UTF-8）
   - 多行文本编码
   - 空字符串编码
   - 特殊字符编码

2. **解码测试**：
   - 标准Base64解码
   - URL安全Base64解码
   - Base64url解码
   - 无效Base64输入
   - 格式自动识别

3. **格式转换测试**：
   - 标准 → URL安全
   - URL安全 → 标准
   - Base64url → 标准

### E2E测试
1. **用户操作流程**：
   - 输入文本 → 编码 → 复制结果
   - 输入Base64 → 解码 → 查看结果
   - 切换格式 → 重新编码
   - 清除输入 → 验证界面状态

2. **错误处理**：
   - 无效输入 → 显示错误提示
   - 空输入 → 禁用操作按钮

## 实现计划

### 阶段1：工具函数实现
1. 创建`base64.ts`文件
2. 实现`encodeBase64`函数
3. 实现`decodeBase64`函数
4. 实现格式识别逻辑
5. 编写单元测试

### 阶段2：UI组件实现
1. 创建`Base64Codec.vue`组件
2. 实现界面布局
3. 实现状态管理
4. 实现用户交互逻辑

### 阶段3：集成和测试
1. 注册工具到`registry.ts`
2. 添加CSS变量
3. 运行单元测试
4. 运行E2E测试
5. 修复发现的问题

## 验收标准

1. **功能完整性**：
   - ✅ 支持标准Base64编码/解码
   - ✅ 支持URL安全Base64编码/解码
   - ✅ 支持Base64url编码/解码
   - ✅ 支持UTF-8字符集处理
   - ✅ 支持多行文本处理

2. **用户体验**：
   - ✅ 界面风格与现有工具一致
   - ✅ 操作简单直观
   - ✅ 错误提示清晰
   - ✅ 支持复制到剪贴板

3. **代码质量**：
   - ✅ TypeScript类型安全
   - ✅ 遵循现有代码风格
   - ✅ 通过所有测试
   - ✅ 无LSP诊断错误

## 后续扩展

1. **文件支持**：后续可添加文件上传和下载功能
2. **批量处理**：支持批量文件编解码
3. **更多格式**：支持Base32、Base58等其他编码格式
4. **历史记录**：保存最近使用的编码/解码记录
