# 变更记录 - 2026-03-23 亮色主题切换

## 变更类型
- [x] 新功能
- [x] 修改功能（UI 主题系统）

## 变更描述
为 DevTools 添加亮色/暗色主题切换功能，在 Header 右侧添加主题切换按钮，用户可手动切换亮色/暗色模式，并持久化存储用户偏好。

## 变更原因
- 当前仅有暗色主题，无法满足不同场景下的使用需求
- 参照 shadcn/ui 官方实现，提升产品体验
- 亮色模式在强光环境下可读性更好

## 影响范围
- 修改文件：`src/assets/styles/globals.css`（添加亮色主题 CSS 变量）
- 修改文件：`src/components/layout/AppHeader.vue`（添加主题切换按钮）
- 新增文件：`src/components/ui/toggle-theme/ToggleTheme.vue`（主题切换组件）
- 修改文件：`src/App.vue`（主题初始化逻辑）

## 设计方案

### 1. 实现原理
- 使用 Tailwind CSS 的 `darkMode: 'class'` 策略（已在 tailwind.config.js 配置）
- 在 `<html>` 标签上切换 `dark` class 来切换主题
- 用户偏好存储在 `localStorage` 的 `theme` key 中
- 首次访问默认使用暗色主题

### 2. CSS 变量体系
当前使用 Tailwind v4 的 `@theme` 指令定义 CSS 变量。需要：
- 将亮色变量移至 `:root`（默认亮色）
- 将暗色变量移至 `.dark` 选择器下
- 保持现有 shadcn-vue 语义化变量名不变

### 3. 文件变更详情

#### 3.1 `globals.css` 变更
```css
/* 亮色主题（默认） */
:root {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(0 0% 9%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(0 0% 9%);
  --color-primary: hsl(0 0% 9%);
  --color-primary-foreground: hsl(0 0% 98%);
  --color-secondary: hsl(0 0% 96%);
  --color-secondary-foreground: hsl(0 0% 9%);
  --color-muted: hsl(0 0% 96%);
  --color-muted-foreground: hsl(0 0% 45%);
  --color-accent: hsl(0 0% 96%);
  --color-accent-foreground: hsl(0 0% 9%);
  --color-border: hsl(0 0% 90%);
  --color-input: hsl(0 0% 90%);
  --color-ring: hsl(0 0% 15%);
  /* ... 其他变量 */
}

/* 暗色主题 */
.dark {
  --color-background: hsl(0 0% 5%);
  --color-foreground: hsl(0 0% 91%);
  /* ... 保持现有暗色变量 */
}
```

#### 3.2 `ToggleTheme.vue` 组件
- 使用 lucide-vue-next 的 Sun/Moon 图标
- 点击按钮直接切换亮色/暗色模式
- 无下拉菜单，保持简洁
- 图标跟随主题变化（亮色显示月亮，暗色显示太阳）

#### 3.3 `AppHeader.vue` 变更
- 在 Badge（版本号）左侧添加 ToggleTheme 组件

#### 3.4 `App.vue` 变更
- 添加主题初始化逻辑（读取 localStorage，设置初始 class）

### 4. 实现步骤

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `globals.css` | 重构 CSS 变量，分离亮/暗色定义 |
| 2 | `ToggleTheme.vue` | 创建主题切换组件 |
| 3 | `AppHeader.vue` | 引入并放置 ToggleTheme |
| 4 | `App.vue` | 添加主题初始化逻辑 |

### 5. 依赖检查
- 图标：使用已安装的 `lucide-vue-next`（Sun/Moon 图标）
- UI 组件：使用已安装的 shadcn-vue Button
- 无新增依赖，无需安装额外组件

### 6. 验证清单
- [ ] 亮色主题下所有页面样式正常
- [ ] 暗色主题下所有页面样式正常（回归测试）
- [ ] 主题切换动画流畅
- [ ] 刷新页面后主题偏好保持
- [ ] 移动端显示正常

---

*方案文档结束*
