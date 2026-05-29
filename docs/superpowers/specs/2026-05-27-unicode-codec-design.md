# Unicode 编码转换工具 — 设计文档

**日期:** 2026-05-27  
**状态:** 已实现  
**工具 ID:** `unicode-codec`

---

## 1. 需求概述

在 dev-tools 工具箱中新增一个 Unicode 编码转换工具，支持：

- 将普通文本编码为 JavaScript Unicode 转义格式（`\uXXXX`）
- 支持两种编码策略：全部字符转义、仅非 ASCII 字符转义
- 将包含 `\uXXXX` 的文本解码回普通字符
- 支持普通文本与 Unicode 转义混合输入
- 非法 Unicode 转义保持原文，不中断转换流程
- 操作由按钮手动触发，不做实时双向同步
- 数据全程本地处理，不上传服务器

本工具聚焦 JavaScript 字符串中常见的 Unicode 转义格式，不扩展到 HTML 实体、URL 编码、Base64 或 `U+XXXX` 码点格式。

---

## 2. 功能规格

### 2.1 操作模式

| 操作 | 触发方式 | 输出 |
|------|---------|------|
| 编码 | 输入文本后点击“编码”按钮 | 一张结果 Card，展示按当前策略转换后的 `\uXXXX` 文本 |
| 解码 | 输入文本后点击“解码”按钮 | 一张结果 Card，展示解码后的普通文本 |
| 清除 | 点击“清除”按钮 | 清空输入框、结果 Card，并将编码策略恢复默认值 |
| 复制 | 点击结果 Card 内“复制”按钮 | 将当前结果复制到剪贴板，并显示 toast 反馈 |

### 2.2 编码策略

编码输出统一使用 JavaScript Unicode 转义格式：`\uXXXX`。十六进制字母使用大写，四位不足时补 `0`。

| 策略 | 说明 | 示例输入 | 示例输出 |
|------|------|---------|---------|
| 全部字符 | 输入中的每个 UTF-16 code unit 都转成 `\uXXXX` | `abc你好` | `\u0061\u0062\u0063\u4F60\u597D` |
| 仅非 ASCII | ASCII 字符保持原文，非 ASCII 字符转成 `\uXXXX` | `abc你好` | `abc\u4F60\u597D` |

**默认策略:** `仅非 ASCII`。这是更常见的开发调试场景，便于保留英文、数字和标点的可读性。

### 2.3 字符处理规则

| 场景 | 处理方式 | 示例 |
|------|---------|------|
| ASCII 字母数字 | “全部字符”下转义；“仅非 ASCII”下保留 | `A` → `\u0041` 或 `A` |
| 空格 | “全部字符”下转义；“仅非 ASCII”下保留 | 空格 → `\u0020` 或空格 |
| 换行 | 按实际换行字符处理，不拆分为 `\n` | 换行 → `\u000A`（全部字符模式） |
| 中文 | 转成对应 `\uXXXX` | `你` → `\u4F60` |
| Emoji 等非 BMP 字符 | 按 JavaScript 字符串 UTF-16 代理对输出 | `😀` → `\uD83D\uDE00` |
| 已存在的反斜杠文本 | 编码时按普通字符处理 | `\u4F60` 在全部字符模式下会逐字符转义 |

这里选择 UTF-16 代理对而不是 `U+1F600`，因为用户明确选择 JavaScript 转义格式，且 JavaScript 字符串中的 `\uXXXX` 本身以 UTF-16 code unit 为单位。

### 2.4 解码策略

解码支持混合文本，只替换合法的 `\uXXXX` 片段，其他内容保持不变。

| 输入 | 输出 | 说明 |
|------|------|------|
| `\u4F60\u597D` | `你好` | 标准连续 Unicode 转义 |
| `abc\u4F60\u597D` | `abc你好` | 普通文本 + Unicode 转义混合 |
| `\uD83D\uDE00` | `😀` | 代理对由 JavaScript 字符串自然组合显示 |
| `abc\uZZZZ` | `abc\uZZZZ` | 非法转义保持原文 |
| `abc\u4F6` | `abc\u4F6` | 不足 4 位保持原文 |
| `abc\\u4F60` | `abc\你` | 解码器逐字扫描，第二个反斜杠开始的 `\u4F60` 是合法转义 |

### 2.5 边界条件

| 场景 | 处理方式 |
|------|---------|
| 空输入或仅空白输入 | “编码”“解码”按钮 disabled，不执行操作 |
| 多行文本 | 保留原有换行结构，逐字符转换 |
| 非法 Unicode 转义 | 保持原文，不显示错误 Card |
| 普通文本执行解码 | 无合法 `\uXXXX` 时原样返回 |
| 解码后再次编码 | 按当前编码策略重新生成结果 |
| 切换编码策略 | 如果当前处于编码结果状态且输入非空，结果随策略重新计算 |
| 当前处于解码结果状态时切换编码策略 | 不影响解码结果，下一次点击“编码”时生效 |

---

## 3. UI 设计

### 3.1 页面结构

页面沿用现有 URL/Base64 编解码工具的单列结构：

```
┌─────────────────────────────────────────────────────┐
│  Unicode 编码转换                                      │
│  字符与 JavaScript Unicode 转义互转                    │
├─────────────────────────────────────────────────────┤
│  使用提示：                                           │
│  \uXXXX 是 JavaScript Unicode 转义格式；编码可选择      │
│  全部字符或仅非 ASCII；非法转义会保持原文。              │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │ textarea                                    │   │
│  │ placeholder: 输入字符或 Unicode 转义...       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  编码策略：[仅非 ASCII] [全部字符]                    │
│                                                     │
│  [编码]  [解码]  ────────────────────────  [清除]   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 编码结果 / 解码结果                           │   │
│  │ ────────────────────────────────────────── │   │
│  │ 结果文本                              [复制] │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 交互行为

| 交互 | 响应 |
|------|------|
| 输入为空 | 编码、解码按钮 disabled |
| 点击“编码” | 使用当前编码策略生成结果，结果标题显示“编码结果” |
| 点击“解码” | 解码合法 `\uXXXX` 片段，结果标题显示“解码结果” |
| 点击编码策略 | 更新当前策略；如果当前展示编码结果，则立即刷新结果 |
| 点击“复制” | 复制结果文本并显示 toast |
| 点击“清除” | 输入、结果、模式清空，编码策略恢复默认值 |

### 3.3 响应式布局

| 断点 | 布局 |
|------|------|
| > 768px | 内容区域最大宽度与 URL/Base64 工具一致，居中显示 |
| ≤ 768px | 单列布局不变，按钮允许换行，保证触控可用 |

### 3.4 注册信息

```ts
{
  id: 'unicode-codec',
  name: 'Unicode编码转换',
  path: '/unicode-codec',
  icon: CaseSensitive,
  description: '字符与Unicode转义互转',
  category: '编解码',
  component: () => import('./unicode-codec/UnicodeCodec.vue'),
}
```

工具卡片颜色使用 CSS 变量 `--tool-unicode`，由 `ToolCard` 按工具 ID 自动应用。

---

## 4. 代码架构

### 4.1 文件结构

```
src/tools/unicode-codec/
├── UnicodeCodec.vue      # 页面组件
└── unicode.ts            # 纯工具函数（无副作用）
```

### 4.2 工具函数接口（`unicode.ts`）

```ts
export interface UnicodeCodecResult {
  success: boolean
  output: string
  error?: string
}

export type UnicodeEncodeMode = 'all' | 'non-ascii'

/**
 * Encode text to JavaScript Unicode escape sequences.
 * @param input - Plain text to encode
 * @param mode - Whether to encode every character or only non-ASCII characters
 */
export function encodeUnicode(
  input: string,
  mode: UnicodeEncodeMode
): UnicodeCodecResult

/**
 * Decode valid \uXXXX sequences while preserving invalid sequences as-is.
 * @param input - Text that may contain JavaScript Unicode escape sequences
 */
export function decodeUnicode(input: string): UnicodeCodecResult
```

`success` 在本工具中始终为 `true`，保留该字段是为了匹配项目已有 Result 模式，方便 UI 组件复用现有结果展示逻辑。

### 4.3 组件状态模型

```ts
type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode | null>(null)
const encodeMode = ref<UnicodeEncodeMode>('non-ascii')
const result = ref<UnicodeCodecResult | null>(null)
```

**按钮行为:**

- `[编码]`：`mode = 'encode'`，调用 `encodeUnicode(input, encodeMode)`
- `[解码]`：`mode = 'decode'`，调用 `decodeUnicode(input)`
- `[清除]`：重置 `input`、`mode`、`result`，并将 `encodeMode` 恢复为 `'non-ascii'`
- 空输入（`input.trim() === ''`）时“编码”“解码”按钮均为 `disabled`

**结果 Card 展示:**

- `mode === 'encode'` → 标题显示“编码结果”
- `mode === 'decode'` → 标题显示“解码结果”
- `mode === null` → 不渲染结果 Card
- `result.success === true` → 显示输出和复制按钮

---

## 5. 测试策略

### 5.1 目录结构

```
tests/unicode-codec-test/
├── axe.config.ts              # axe-core 无障碍配置
├── unit/
│   └── unicode.test.ts        # 纯函数单元测试（Vitest）
├── e2e/
│   ├── unicode-codec.spec.ts  # 页面交互（Playwright）
│   └── axe.spec.ts            # 无障碍审计（axe-core，WCAG 2.1 AA）
└── visual/
    ├── baseline/              # 基准截图
    └── visual.spec.ts         # 像素回归对比
```

`tests/config.ts` 的 `testDirs` 需追加 `'unicode-codec-test'`。

### 5.2 单元测试覆盖点（`unicode.test.ts`）

| 函数 | 用例 |
|------|------|
| `encodeUnicode` 全部字符模式 | `abc` → `\u0061\u0062\u0063`；`abc你好` → `\u0061\u0062\u0063\u4F60\u597D`；空格 → `\u0020`；换行 → `\u000A`；空字符串返回空 |
| `encodeUnicode` 仅非 ASCII 模式 | `abc` → `abc`；`abc你好` → `abc\u4F60\u597D`；ASCII 标点保持原文；中文转义；换行和空格保持原文 |
| `encodeUnicode` 非 BMP 字符 | `😀` → `\uD83D\uDE00`；`A😀中` 在仅非 ASCII 模式下 → `A\uD83D\uDE00\u4E2D` |
| `encodeUnicode` 十六进制格式 | 输出十六进制字母大写；不足 4 位补零，例如 `A` → `\u0041` |
| `decodeUnicode` 标准转义 | `\u4F60\u597D` → `你好`；`\u0061\u0062\u0063` → `abc` |
| `decodeUnicode` 混合文本 | `abc\u4F60\u597D` → `abc你好`；`hello \u4E16\u754C` → `hello 世界` |
| `decodeUnicode` 非 BMP 字符 | `\uD83D\uDE00` → `😀` |
| `decodeUnicode` 非法转义保留 | `\uZZZZ`、`\u4F6`、`\u`、`abc\uZZZZ` 均保持原样 |
| `decodeUnicode` 普通文本 | `abc你好` 原样返回；空字符串返回空 |

### 5.3 明确测试用例表

| 编号 | 操作 | 输入 | 选项 | 期望输出 |
|------|------|------|------|---------|
| U-01 | 编码 | `abc` | 全部字符 | `\u0061\u0062\u0063` |
| U-02 | 编码 | `abc` | 仅非 ASCII | `abc` |
| U-03 | 编码 | `你好` | 全部字符 | `\u4F60\u597D` |
| U-04 | 编码 | `abc你好` | 仅非 ASCII | `abc\u4F60\u597D` |
| U-05 | 编码 | `A B` | 全部字符 | `\u0041\u0020\u0042` |
| U-06 | 编码 | `😀` | 全部字符 | `\uD83D\uDE00` |
| U-07 | 编码 | `A😀中` | 仅非 ASCII | `A\uD83D\uDE00\u4E2D` |
| U-08 | 解码 | `\u0061\u0062\u0063` | - | `abc` |
| U-09 | 解码 | `abc\u4F60\u597D` | - | `abc你好` |
| U-10 | 解码 | `\uD83D\uDE00` | - | `😀` |
| U-11 | 解码 | `abc\uZZZZ` | - | `abc\uZZZZ` |
| U-12 | 解码 | `abc\u4F6` | - | `abc\u4F6` |
| U-13 | 解码 | `abc你好` | - | `abc你好` |

### 5.4 E2E 测试覆盖点（`unicode-codec.spec.ts`）

- 页面可访问，标题为“Unicode编码转换”
- 空输入时“编码”“解码”按钮为 disabled
- 默认策略为“仅非 ASCII”
- 输入 `abc你好` 后点击“编码” → 结果为 `abc\u4F60\u597D`
- 切换到“全部字符” → 编码结果更新为 `\u0061\u0062\u0063\u4F60\u597D`
- 输入 `abc\u4F60\u597D` 后点击“解码” → 结果为 `abc你好`
- 输入 `abc\uZZZZ` 后点击“解码” → 结果保持 `abc\uZZZZ`，不显示错误提示
- 点击“复制” → toast 显示“已复制到剪贴板”
- 点击“清除” → 输入框清空，结果 Card 消失，编码策略恢复默认值

### 5.5 无障碍测试（`axe.spec.ts`）

使用 `@axe-core/playwright` 对工具页面进行 WCAG 2.1 AA 合规审计，配置见 `axe.config.ts`（与现有工具同模式）。重点检查：

- textarea 有可访问名称
- 编码策略按钮可通过键盘操作
- 编码、解码、清除、复制按钮有明确文本
- 结果区域在浅色和深色主题下对比度合格

### 5.6 视觉回归测试

首次实现后生成基准截图，覆盖：

- 初始空状态
- 编码结果状态
- 解码结果状态
- 移动端窄屏布局
- 深色主题下的结果 Card

---

## 6. 开发流程

按照项目 TDD 流程：

1. 创建 `src/tools/unicode-codec/unicode.ts` 工具函数骨架
2. 编写 `tests/unicode-codec-test/unit/unicode.test.ts` 单元测试（红阶段确认失败）
3. 实现 `encodeUnicode` 和 `decodeUnicode`（绿阶段确认通过）
4. 创建 `UnicodeCodec.vue` 页面组件
5. 注册工具到 `src/tools/registry.ts`
6. 在 `src/assets/styles/globals.css` 添加 `--tool-unicode` 浅色和深色主题变量
7. 编写 E2E、axe 和视觉回归测试
8. 更新 `tests/config.ts` 追加 `'unicode-codec-test'`
9. 运行 `npm run test`
10. 运行 `npm run test:e2e`
11. 运行 `npm run build`

---

## 7. 验收标准

### 7.1 功能完整性

- 支持字符 → JavaScript Unicode 转义编码
- 支持 JavaScript Unicode 转义 → 字符解码
- 支持“全部字符”和“仅非 ASCII”两种编码策略
- 支持中文、ASCII、空格、换行、Emoji 等输入
- 非法 Unicode 转义保持原文，不阻断操作
- 支持复制结果和清除状态

### 7.2 用户体验

- 页面风格与 URL/Base64 编解码工具一致
- 默认策略符合常见使用场景，即“仅非 ASCII”
- 结果区标题能清楚区分编码结果和解码结果
- 空输入时不可执行转换，避免无意义操作
- 移动端可正常输入、切换策略、复制结果

### 7.3 代码质量

- 工具函数为纯函数，无副作用
- TypeScript 类型明确，不使用 `any`
- Vue 组件使用 `<script setup lang="ts">`
- 遵循项目 Result 模式：`{ success, output, error? }`
- 单元测试、E2E、无障碍测试、构建全部通过

---

## 8. 后续扩展（非本次范围）

- 支持 `U+XXXX` 码点格式
- 支持 HTML 实体编码/解码
- 支持 `\xXX` 短转义格式
- 支持 JSON 字符串转义/反转义
- 支持批量文件转换

---

*文档结束*
