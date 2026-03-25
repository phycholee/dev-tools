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

关键区别：`encodeURIComponent("a=1&b=2")` → `"a%3D1%26b%3D2"`（编码 `=` 和 `&`），而 `encodeURI("a=1&b=2")` → `"a=1&b=2"`（保留 `=` 和 `&`）。这是两个函数存在的核心价值所在，单元测试必须覆盖此差异。

两个编码函数在正常字符串输入下**不会抛出异常**（唯一例外：含孤立代理对的字符串对 `encodeURIComponent` 会抛 `URIError`，属极罕见的畸形字符串场景）。因此 `success` 字段在编码操作中始终为 `true`，函数签名与 `UrlCodecResult` 保持一致仅为统一接口风格。

### 2.3 解码策略

解码分两类错误情形，处理方式不同：

1. **保留字符序列**（如 `%23` → `#`）：`decodeURIComponent` 会抛 `URIError`（因为 `%23` 是保留字符），此时 fallback 到 `decodeURI` 可成功解码
2. **非法百分号序列**（如 `%GG`）：`decodeURIComponent` 和 `decodeURI` 均会抛 `URIError`，fallback 无意义，直接返回错误

实现逻辑：

```
try decodeURIComponent(input)
  → 成功：返回 { success: true, output }
  → URIError：try decodeURI(input)
      → 成功：返回 { success: true, output }
      → URIError：返回 { success: false, error: 原始错误信息 }
```

### 2.4 边界条件

| 场景 | 处理方式 |
|------|---------|
| 空输入 | "编码"/"解码"按钮 disabled，不执行操作 |
| 解码非法序列（如 `%GG`） | Card 显示红色错误提示 + 具体原因，复制按钮 disabled |
| 解码未编码的普通文本 | 正常返回原文，不报错 |
| 编码已编码的文本 | 正常执行（幂等，对 `%` 再次编码为 `%25`） |
| 结果 Card 处于错误状态 | 复制按钮 disabled（与 JSON formatter 保持一致） |

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
│  ── 编码模式：两张并排 Card（grid-cols-1 lg:grid-cols-2）
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
 * Encode text using encodeURIComponent.
 * Suitable for URL parameter values — encodes =, &, #, /, etc.
 * Always returns success: true for valid JS strings.
 * @param input - Plain text to encode
 */
export function encodeURIComponentSafe(input: string): UrlCodecResult

/**
 * Encode text using encodeURI.
 * Suitable for full URLs — preserves structural characters (: / ? # & = etc.)
 * Always returns success: true for valid JS strings.
 * @param input - Full URL or plain text to encode
 */
export function encodeURISafe(input: string): UrlCodecResult

/**
 * Decode URL-encoded string.
 * Strategy: try decodeURIComponent → fallback to decodeURI → error.
 * Returns success: false only when both decoders throw URIError (e.g. %GG).
 * @param input - URL-encoded string to decode
 */
export function decodeUrlSafe(input: string): UrlCodecResult
```

### 4.3 组件状态模型

```ts
// Defined in UrlCodec.vue script setup
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
- `[清除]`：重置所有 ref 为初始值（`input = ''`，`mode = null`，结果全为 `null`）
- 空输入（`input.trim() === ''`）时"编码"/"解码"按钮均为 `disabled`

**结果 Card 展示：**

- `mode === 'encode'` → `grid grid-cols-1 lg:grid-cols-2`，两张 Card
- `mode === 'decode'` → 单张全宽 Card
- `mode === null` → 不渲染结果区域

**复制按钮 disabled 条件：** `!result.success`（与 JSON formatter 的 `hasError` 模式一致）

---

## 5. 测试策略

### 5.1 目录结构

```
tests/url-codec-test/
├── axe.config.ts          # axe-core 无障碍配置
├── unit/
│   └── url.test.ts        # 纯函数单元测试（Vitest）
├── e2e/
│   ├── url-codec.spec.ts  # 页面交互（Playwright）
│   └── axe.spec.ts        # 无障碍审计（axe-core，WCAG 2.1 AA）
└── visual/
    ├── baseline/           # 基准截图（tests/url-codec-test/visual/baseline/）
    └── visual.spec.ts      # 像素回归对比（1% 阈值）
```

`tests/config.ts` 的 `testDirs` 需追加 `'url-codec-test'`。

### 5.2 单元测试覆盖点（`url.test.ts`）

| 函数 | 用例 |
|------|------|
| `encodeURIComponentSafe` | 中文字符 → `%XX` 序列；空格 → `%20`；`& = +` 被编码；空字符串返回空；已编码文本（`%` → `%25`，幂等） |
| `encodeURISafe` | 完整 URL 保留 `://`、`?`、`#`、`/`；中文参数被编码；**关键差异用例**：`"a=1&b=2"` → `"a=1&b=2"`（保留 `=` 和 `&`，与 encodeURIComponent 结果不同） |
| `encodeURIComponent` vs `encodeURI` 差异 | 同一输入 `"a=1&b=2"`：前者 → `"a%3D1%26b%3D2"`，后者 → `"a=1&b=2"` |
| `decodeUrlSafe` | 标准 `%XX` 序列；中文 `%E4%B8%AD%E6%96%87` → `"中文"`；普通文本原样返回；`%23` → `#`（fallback 到 decodeURI 成功）；`%GG` → `success: false` + 错误信息 |

### 5.3 E2E 测试覆盖点（`url-codec.spec.ts`）

- 页面可访问，标题为"URL编解码"
- 空输入时"编码"/"解码"按钮为 `disabled`
- 输入内容后点"编码" → 两张 Card 出现，`encodeURIComponent` 和 `encodeURI` 结果正确
- 输入内容后点"解码" → 一张 Card 出现，解码结果正确
- 编码 Card 点"复制" → toast 显示"已复制到剪贴板"
- 点"清除" → 输入框清空，结果 Card 消失
- 输入非法编码序列（如 `%GG`）后点"解码" → 错误提示出现，复制按钮 disabled

### 5.4 无障碍测试（`axe.spec.ts`）

使用 `@axe-core/playwright` 对工具页面进行 WCAG 2.1 AA 合规审计，配置见 `axe.config.ts`（与现有工具同模式）。

---

## 6. 开发流程

按照项目 TDD 强制流程：

1. 先写 `url.ts` 工具函数骨架
2. 写单元测试（红阶段确认失败）
3. 实现函数（绿阶段确认通过）
4. 实现 `UrlCodec.vue` 组件
5. 写 E2E 测试 + axe 无障碍测试
6. 写视觉回归测试（首次运行生成 baseline）
7. 更新 `tests/config.ts` 追加 `'url-codec-test'`
8. `npm run build` 确认编译通过
9. `npm run test && npm run test:e2e` 全部通过
