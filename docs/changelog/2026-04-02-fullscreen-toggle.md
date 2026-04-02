# 变更记录 - 2026-04-02

## 变更类型
- [x] 新增功能

## 变更描述
新增全屏模式切换功能。支持全屏模式的工具页面，可在全局 Header 中点击切换按钮，在居中布局和全屏布局之间切换，header 和页面内容同步响应。当前仅 JSON 格式化工具启用此功能。

## 变更原因
JSON 格式化工具在处理大 JSON 时，`max-w-6xl` 居中布局限制了可用宽度，用户希望输入/输出框可以占满全屏以获得更大的工作区域。

## 影响范围
- 影响的文件/模块：
  - `src/types/tool.ts` — ToolDefinition 接口新增 `fullscreen` 字段
  - `src/tools/registry.ts` — json-formatter 配置 `fullscreen: true`
  - `src/App.vue` — 新增全局 fullscreen 状态和 provide
  - `src/components/layout/AppHeader.vue` — 新增全屏切换按钮，header 宽度响应
  - `src/tools/json-formatter/JsonFormatter.vue` — 移除本地 isWide，消费全局 isFullscreen
- 是否需要更新文档：否
- 是否需要更新测试：否（现有 E2E 选择器未受影响）
