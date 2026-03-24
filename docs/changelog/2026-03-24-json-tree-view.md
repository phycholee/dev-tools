# 变更记录 - 2026-03-24 JSON Tree View

## 变更类型
- [x] 新功能

## 变更描述
为 JSON Formatter 添加树状折叠/展开功能，在输出区域的对象 `{` 和数组 `[` 前添加 `▼`/`▶` 切换按钮，折叠时显示 `Object{...}` 或 `Array[n]` 摘要。

## 变更原因
- JSON 输出过长时难以阅读
- 树状折叠可以快速定位感兴趣的层级
- 类似 VSCode/Chrome DevTools 的 JSON 查看体验

## 影响范围
- 修改文件：`src/tools/json-formatter/json.ts`（新增 `JsonNode` 接口 + `parseJsonTree()`）
- 修改文件：`src/tools/json-formatter/CodeEditor.vue`（tree view 渲染 + `indent` prop）
- 修改文件：`src/tools/json-formatter/JsonFormatter.vue`（传递 `indent` prop）
- 新增文件：`tests/json-formatter-test/unit/parseJsonTree.test.ts`（13 个单元测试）

## 测试结果
- 单元测试：57/57 通过（含 13 个新测试）
- E2E 测试：8/8 通过
- Build：通过

## 关键教训
- 首次实现跳过测试交付，结果完全不可用
- parseJsonTree 必须遍历 parsed JSON value，不能解析格式化文本
- escape 输出是合法 JSON 字符串值，需特殊处理避免进入 tree view
- 改动渲染层必须验证 E2E 选择器兼容性
