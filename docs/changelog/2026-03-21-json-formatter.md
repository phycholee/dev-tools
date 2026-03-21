# 变更记录 - 2026-03-21

## 变更类型
- [x] 新功能

## 变更描述
实现 JSON 格式化工具，包含完整功能：

- **json.ts**: JSON 工具函数（formatJson, compressJson, escapeJson, unescapeJson, validateJson, highlightJson）
- **CodeEditor.vue**: 可复用的代码编辑器组件（输入/输出双面板，语法高亮）
- **JsonFormatter.vue**: JSON 格式化工具页面（格式化、压缩、转义、消除转义、复制、清空、缩进切换）

## 功能特性
- JSON 美化（支持 2/4 空格缩进）
- JSON 压缩（单行输出）
- JSON 转义/消除转义
- 语法校验和错误提示
- 自定义语法高亮（key/string/number/boolean/null 分色）
- 剪贴板复制
- 自动格式化（500ms debounce）
- 实时状态指示

## 影响范围
- 新增文件：json.ts, CodeEditor.vue
- 修改文件：JsonFormatter.vue（从占位替换为完整实现）
- 修改文件：globals.css（新增 JSON 语法高亮 CSS 类）

## 相关文档
- 产品文档：docs/specs/2026-03-20-devtools-design.md
- 实现计划：docs/superpowers/plans/2026-03-21-phase2-json-formatter.md
