# URL编解码工具 — 设计文档

**日期:** 2026-03-25
**状态:** 已批准
**工具 ID:** `url-codec`

---

## 1. 需求概述

在 dev-tools 工具箱中新增一个 URL 编解码工具，支持：

- 将任意文本同时编码为两种格式（`encodeURIComponent` 和 `encodeURI`）
- 将 URL 编码文本解码为原始文本
- 操作由按钮手动触发（不自动转换）
- 数据全程本地处理，不上传服务器

---

## 2. 功能规格

### 2.1 操作模式

| 操作 | 触发方式 | 输出 |
|------|---------|------|
| 编码 | 点击"编码"按钮 | 两张并排 Card，分别展示 `encodeURIComponent` 和 `encodeURI` 结果 |
| 解码 | 点击"解码"按钮 | 一张全宽 Card，展示解码结果 |
| 清除 | 点击"清除"按钮 | 清空输入框和所有结果 Card |

### 2.2 编码说明

| 编码方式 | 适用场景 | 保留字符 |
|---------|---------|---------|
| `encodeURIComponent` | URL 参数值 | 字母、数字、`- _ . ! ~ * ' ( )` |
| `encodeURI` | 完整 URL | 额外保留 `: / ? # [ ] @ ! $ & ' ( ) * + , ; =` |

### 2.3 解码策略

1. 优先使用 `decodeURIComponent`（覆盖范围更广）
2. 若抛出 `URIError`，fallback 到 `decodeURI`
3. 两者均失败则返回错误信息

### 2.4 边界条件

| 场景 | 处理方式 |
|------|---------|
| 空输入 | "编码"/"解码"按钮 disabled，不执行操作 |
| 解码非法序列（如 `%GG`） | Card 显示红色错误提示 + 具体原因 |
| 解码未编码的普通文本 | 正常返回原文，不报错 |
| 编码已编码的文本 | 正常执行（幂等，对 `%` 再次编码为 `%25`） |

---

## 3. UI 设计

### 3.1 页面结构

```
┌─────────────────────────────────────────────────────┐
│  🔗 URL 编解码                                        │
│  URL编码与解码工具                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  textarea（多行，用户可 resize）               │   │
│  │  placeholder: 输入文本或 URL...               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [编码]  [解码]  ────────────────────────  [清除]   │
│                                                     │
│  ── 编码模式：两张并排 Card（grid-cols-1 lg:grid-cols-2）│
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │ encodeURIComponent│  │ encodeURI            │    │
│  │ 适用：参数值       │  │ 适用：完整 URL         │    │
│  │ ────────────────  │  │ ──────────────────── │    │
│  │ 结果...    [复制]  │  │ 结果...        [复制] │    │
│  └──────────────────┘  └──────────────────────┘    │
│                                                     │
│  ── 解码模式：一张全宽 Card ─────────────────────── │
│  ┌─────────────────────────────────────────────┐   │
│  │ 解码结果                                     │   │
│  │ ────────────────────────────────────────── │   │
│  │ 结果...                              [复制]  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 注册信息

```ts
{
  id: 'url-codec',
  name: 'URL编解码',
  path: '/url-codec',
  icon: '🔗',
  description: 'URL编码与解码',
  category: '编解码',
  component: () => import('./url-codec/UrlCodec.vue'),
  color: '#10b981'  // 绿色
}
```

---

## 4. 代码架构

### 4.1 文件结构

```
src/tools/url-codec/
├── UrlCodec.vue        # 页面组件
└── url.ts              # 纯工具函数（无副作用）
```

### 4.2 工具函数接口（`url.ts`）

```ts
export interface UrlCodecResult {
  success: boolean
  output: string
  error?: string
}

/**
 * Encode text using encodeURIComponent
 * Suitable for URL parameter values
 * @param input - Plain text to encode
 */
export function encodeURIComponentSafe(input: string): UrlCodecResult

/**
 * Encode text using encodeURI
 * Suitable for full URLs (preserves structural characters)
 * @param input - Full URL or plain text to encode
 */
export function encodeURISafe(input: string): UrlCodecResult

/**
 * Decode URL-encoded string
 * Tries decodeURIComponent first, falls back to decodeURI
 * @param input - URL-encoded string to decode
 */
export function decodeUrlSafe(input: string): UrlCodecResult
```

### 4.3 组件状态模型

```ts
type Mode = 'encode' | 'decode'

const input = ref('')
const mode = ref<Mode | null>(null)          // null = 初始态，不显示结果
const encodeComponentResult = ref<UrlCodecResult | null>(null)
const encodeUriResult = ref<UrlCodecResult | null>(null)
const decodeResult = ref<UrlCodecResult | null>(null)
```

**按钮行为：**

- `[编码]`：`mode = 'encode'`，计算 `encodeComponentResult` + `encodeUriResult`
- `[解码]`：`mode = 'decode'`，计算 `decodeResult`
- `[清除]`：重置所有 ref 为初始值
- 空输入时"编码"/"解码"按钮均为 `disabled`

**结果 Card 展示：**

- `mode === 'encode'` → `grid grid-cols-1 lg:grid-cols-2`，两张 Card
- `mode === 'decode'` → 单张全宽 Card
- `mode === null` → 不渲染结果区域

---

## 5. 测试策略

### 5.1 目录结构

```
tests/url-codec-test/
├── unit/
│   └── url.test.ts        # 纯函数单元测试（Vitest）
├── e2e/
│   ├── url-codec.spec.ts  # 页面交互（Playwright）
│   └── axe.spec.ts        # 无障碍审计（axe-core）
└── visual/
    ├── baseline/           # 基准截图
    └── visual.spec.ts      # 像素回归对比
```

`tests/config.ts` 的 `testDirs` 需追加 `'url-codec-test'`。

### 5.2 单元测试覆盖点

| 函数 | 用例 |
|------|------|
| `encodeURIComponentSafe` | 中文字符、空格、`& = +`、空字符串、已编码文本（幂等） |
| `encodeURISafe` | 完整 URL 保留 `://`、`?`、`#`、`/`；中文参数被编码 |
| `decodeUrlSafe` | 标准 `%XX` 序列、中文解码、普通文本原样返回、`%GG` 非法序列报错 |

### 5.3 E2E 测试覆盖点

- 页面可访问，标题为"URL编解码"
- 空输入时"编码"/"解码"按钮为 disabled
- 输入内容后点"编码" → 两张 Card 出现，内容正确
- 输入内容后点"解码" → 一张 Card 出现，内容正确
- 编码 Card 点"复制" → toast 显示"已复制到剪贴板"
- 点"清除" → 输入框清空，结果 Card 消失
- 输入非法编码序列后点"解码" → 错误提示出现

---

## 6. 开发流程

按照项目 TDD 强制流程：

1. 先写 `url.ts` 工具函数
2. 写单元测试（红阶段确认失败）
3. 实现函数（绿阶段确认通过）
4. 实现 `UrlCodec.vue` 组件
5. 写 E2E 测试
6. 写视觉回归测试
7. `npm run build` 确认编译通过
8. `npm run test && npm run test:e2e` 全部通过
