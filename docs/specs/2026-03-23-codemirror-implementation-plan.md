# CodeMirror 6 集成实现计划

## 步骤

### 1. 安装依赖
```bash
npm install vue-codemirror codemirror @codemirror/lang-json @codemirror/theme-one-dark
```

### 2. 修改 CodeEditor.vue

**2.1 导入 CodeMirror 相关模块**
- `Codemirror` 组件
- `json()` 语言支持
- `oneDark` 主题
- `basicSetup` 基础配置

**2.2 替换输入模式**
- 将 `<textarea>` 替换为 `<Codemirror>`
- 配置扩展：basicSetup, json(), oneDark
- 绑定 v-model
- 配置 placeholder

**2.3 移除旧代码**
- 删除 textarea 相关代码
- 删除行号测量逻辑（measureLineHeights, lineHeights, lineItems）
- 删除 scroll 同步逻辑（scrollTop, handleScroll）

### 3. 样式调整
- 确保 CodeMirror 高度填满容器
- 调整 padding 对齐

### 4. 测试验证
- 行号显示正确
- 换行时行号对齐
- JSON 语法高亮
- 输入、复制、粘贴正常
- 与输出框交互正常

## 文件变更

| 文件 | 操作 |
|------|------|
| `package.json` | npm install 自动更新 |
| `CodeEditor.vue` | 重构输入模式 |

---

*实现计划结束*
