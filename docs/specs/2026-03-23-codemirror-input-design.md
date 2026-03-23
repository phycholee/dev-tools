# CodeMirror 6 输入框集成设计

> 文档版本：v1.0
> 创建日期：2026-03-23
> 状态：已批准

## 问题背景

当前 JSON 格式化工具的输入框使用原生 textarea，存在行号显示问题：
- 行号和 textarea 是分离的 DOM 元素
- 无法准确测量每行的实际高度（包括换行）
- 行号位置与实际内容对齐不准确

## 解决方案

引入 CodeMirror 6 专业代码编辑器替换 textarea，利用其内置的行号功能。

## 设计详情

### 1. 依赖变更

**新增依赖：**
```json
{
  "vue-codemirror": "^6.x",
  "codemirror": "^6.x",
  "@codemirror/lang-json": "^6.x",
  "@codemirror/theme-one-dark": "^6.x"
}
```

### 2. 组件变更

**CodeEditor.vue 变更：**

| 模式 | 变更前 | 变更后 |
|------|--------|--------|
| 输入 | `<textarea>` | `<Codemirror>` |
| 输出 | `<pre><code>` | 不变 |

### 3. CodeMirror 配置

```typescript
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { basicSetup } from 'codemirror'

// 扩展配置
const extensions = [
  basicSetup,      // 基础功能（包含行号）
  json(),          // JSON 语法高亮
  oneDark          // 暗色主题
]
```

### 4. 主题适配

使用 `oneDark` 主题，与项目现有的暗色风格一致。

### 5. 受控组件

CodeMirror 作为受控组件使用：
- `v-model` 绑定输入内容
- `@change` 事件同步到父组件

## 影响范围

| 文件 | 变更类型 |
|------|----------|
| `package.json` | 新增依赖 |
| `src/tools/json-formatter/CodeEditor.vue` | 重构输入模式 |

## 验证清单

- [ ] CodeMirror 正确显示行号
- [ ] 行号与内容对齐（包括换行）
- [ ] JSON 语法高亮正常
- [ ] 暗色主题显示正确
- [ ] 输入、复制、粘贴功能正常
- [ ] 与输出框交互正常（格式化、压缩等）

---

*设计文档结束*
