# DevTools 项目 - AI 长期记忆

> 最后更新：2026-03-24
> 用途：记录任务目标、历史步骤、中间结果、关键决策，支持迭代和中断恢复

---

## 一、项目概览

### 1.1 项目信息
- **项目名称：** DevTools 开发者工具箱
- **项目定位：** 面向开发者的在线工具集合网站
- **目标用户：** 程序员、运维工程师、数据分析师
- **技术栈：** Vite 5.x + Vue 3.x + TypeScript 5.x + Vue Router 4.x + Tailwind CSS + shadcn-vue
- **UI风格：** Vercel/Geist 风格（shadcn-vue + Tailwind CSS）
- **部署方式：** 纯前端，可部署到 Vercel/GitHub Pages

### 1.2 核心价值
- 纯前端实现，数据不上传，隐私安全
- 即开即用，无需注册
- 工具注册机制，方便扩展

---

## 二、任务目标

### 2.1 首期功能
1. **JSON格式化工具**
   - 结构格式化（美化，支持2/4空格缩进）
   - 压缩（去除空白，单行输出）
   - 转义（JSON转字符串转义格式）
   - 消除转义（还原转义的JSON字符串）
   - 语法校验（检测错误，显示位置）
   - 语法高亮（输出区域着色）

2. **时间戳转换工具**
   - 时间戳→日期（支持秒/毫秒）
   - 日期→时间戳
   - 当前时间戳实时显示
   - 时区转换
   - 批量转换

### 2.2 未来扩展工具
- Base64编解码、URL编解码、正则表达式测试
- 代码格式化、Diff对比、颜色转换
- UUID生成、Hash计算

---

## 三、开发进度

### 3.1 阶段一：基础搭建 ✓ 已完成 (2026-03-20)

**完成内容：**
- [x] Vite + Vue 3 + TypeScript 项目初始化
- [x] 暗色主题基础样式（CSS Variables）
- [x] 工具类型定义和注册机制
- [x] Vue Router 4 路由配置（支持动态工具路由）
- [x] 布局组件（AppHeader、AppSidebar、AppLayout）
- [x] 主页面开发（ToolCard组件、HomePage实现）

**Git提交：**
```
87847dc docs: 添加阶段一变更记录
01bbf74 feat: 实现主页面和工具卡片组件
05f14e6 feat: 添加布局组件（Header、Sidebar、Layout）
7f7f6aa feat: 添加路由配置和动态工具路由
dcf6a95 feat: 添加工具类型定义和注册机制
be91303 feat(style): 添加暗色主题基础样式
a53812a fix: 升级vue-tsc到2.x解决Node 24兼容性问题
90cf5e4 chore: 初始化 Vite + Vue 3 + TypeScript 项目
4978197 chore: 初始化DevTools项目
```

### 3.2 阶段二：JSON格式化工具 ✅ 已完成 (2026-03-21)

**完成内容：**
- [x] CodeEditor组件开发（输入/输出双面板，语法高亮）
- [x] JSON解析和格式化逻辑（beautify/compress/escape/unescape）
- [x] 转义/消除转义功能
- [x] 语法高亮（自定义CSS类实现）
- [x] 复制、清空功能
- [x] 错误提示
- [x] 缩进切换（2/4空格）
- [x] 自动格式化（500ms debounce）

### 3.3 阶段三：时间戳转换工具 ✅ 已完成 (2026-03-21)

**完成内容：**
- [x] 当前时间戳实时显示（秒/毫秒，每秒更新）
- [x] 时间戳→日期转换（支持秒/毫秒自动检测）
- [x] 日期→时间戳转换
- [x] 时区选择（11个常用时区）
- [x] 批量转换
- [x] 格式化时间显示（yyyy-MM-dd HH:mm:ss）
- [x] 日期输入格式验证（红色边框提示）
- [x] 安装shadcn Select组件替换原生select
- [x] 统一UI样式（输出框、按钮、标题）

**Git提交：**
```
0bacb20 feat(timestamp): add timestamp utility functions
a29b8ab feat(timestamp): implement full timestamp converter page
5e19201 fix(timestamp): fix unused timezone parameter
```

### 3.4 阶段四：UI优化和bug修复 ✅ 已完成 (2026-03-22)

**完成内容：**
- [x] shadcn主题修复（primary颜色改为白色，logo保留蓝紫色）
- [x] 按钮点击动画（active:translate-y-px向下移动效果）
- [x] 安装shadcn Select组件，替换原生select元素
- [x] 修复边框白色亮边问题（@layer base设置默认border-color）
- [x] 统一时间戳转换工具UI样式
- [x] AppHeader重构为shadcn风格hero（首页1/3页面标题区，工具页仅navbar）
- [x] 修复页面导航时navbar位移问题（滚动条+DOM结构）

**关键问题和解决方案：**
| 问题 | 解决方案 |
|------|----------|
| primary颜色导致logo变白 | logo使用inline style指定蓝紫色 |
| 原生select样式不一致 | 安装shadcn Select组件 |
| 边框有白色亮边 | 添加@layer base规则设置border-color |
| 按钮无点击反馈 | 添加active:translate-y-px动画 |
| 导航到时间戳页面时navbar位移 | 见下方详细记录 |

**Git提交：**
```
8e59f91 fix(style): set default border color via base layer rule
e28d3ec feat(ui): install shadcn Select, replace native select elements
df6207a fix(ui): change button active effect to translate-y-px
5af5f72 fix(style): change primary to white, match standard shadcn dark theme
952d59b fix(ui): restore logo color to blue/purple with inline style
55376c2 refactor(header): shadcn-style hero section on homepage, compact header on tool pages
3191353 fix(header): move hero to HomePage to prevent navbar shift on navigation
09e6fe4 fix(style): force scrollbar always visible to prevent layout shift on navigation
```

### 3.5 阶段五：JSON Tree View ✅ 已完成 (2026-03-24)

**完成内容：**
- [x] `parseJsonTree()` 函数 — 解析 JSON 为树结构，计算行号
- [x] CodeEditor tree view — 折叠/展开对象和数组
- [x] 折叠摘要：`Object{...}` / `Array[n]`
- [x] `indent` prop 支持（跟随用户缩进设置）
- [x] 13 个 parseJsonTree 单元测试
- [x] 全部 8 个 E2E 测试通过

**关键问题和教训（重要）：**
| 问题 | 原因 | 解决方案 | 教训 |
|------|------|----------|------|
| 首次实现完全不能用 | 没测试就交付，parseJsonTree 解析格式化文本而非原始 JSON | 改为直接遍历 parsed JSON value 计算行号 | **必须先跑测试再交付** |
| escape/unescape 输出显示异常 | parseJsonTree 把 escape 输出（合法 JSON 字符串）解析成功，JSON.stringify 把 `\n` 变成实际换行 | treeRoot 只在输出以 `{` 或 `[` 开头时激活 | 非 JSON 输出需要特殊处理 |
| E2E 测试 DOM 选择器不兼容 | 模板结构改变导致 `div:has(> div.flex > pre)` 失效 | 保持 `div.flex > pre` 结构，tree/fallback 都用相同 DOM | 改动渲染层时必须验证 E2E 选择器 |

**核心教训（2026-03-24）：**
> **不测试不交付。** 首次实现跳过测试直接交付，结果完全不能用。TDD 不是可选项——先写测试、确认失败、再实现、再跑测试通过，这个流程必须严格遵守。E2E 测试和单元测试同等重要，改动 DOM 结构前必须确认选择器兼容性。

### 3.6 阶段六：亮色主题切换 ⏳ 待开发

**计划内容：**
- [ ] 重构 globals.css CSS 变量体系（分离亮/暗色）
- [ ] 创建 ToggleTheme.vue 组件（Sun/Moon 图标切换）
- [ ] AppHeader.vue 添加主题切换按钮
- [ ] App.vue 添加主题初始化逻辑（localStorage 持久化）
- [ ] 亮色主题下所有页面样式验证

**变更记录：** `docs/changelog/2026-03-23-light-theme-toggle.md`

### 3.6 阶段六：优化和部署 ⏳ 待开始

**计划内容：**
- [ ] 移动端适配
- [ ] 性能优化
- [ ] 部署到 Vercel / GitHub Pages

---

## 四、项目结构

```
devtools/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css          # 全局样式（暗色主题变量）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue     # 顶部导航栏（logo + badge，纯 navbar，无条件逻辑）
│   │   │   ├── AppSidebar.vue    # 工具列表侧边栏
│   │   │   └── AppLayout.vue     # 布局容器
│   │   └── common/
│   │       └── ToolCard.vue      # 工具卡片组件
│   ├── pages/
│   │   └── HomePage.vue          # 主页面（含 hero section + 工具卡片列表）
│   ├── tools/
│   │   ├── registry.ts           # 工具注册表
│   │   ├── json-formatter/
│   │   │   └── JsonFormatter.vue # JSON格式化工具页（占位）
│   │   └── timestamp-converter/
│   │       └── TimestampConverter.vue # 时间戳转换工具页（占位）
│   ├── router/
│   │   └── index.ts              # 路由配置（动态生成工具路由）
│   ├── types/
│   │   └── tool.ts               # 工具类型定义
│   ├── App.vue
│   └── main.ts
│   ├── lib/
│   │   └── utils.ts          # 公共工具
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css   # 全局 CSS
│   └── components/
│       └── ui/                # 新增 UI 组件目录
│           └── (占位)
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── .gitignore
```

---

## 五、关键决策记录

### 5.1 技术栈决策
| 决策点 | 选择 | 原因 |
|--------|------|------|
| 框架 | Vue 3 | 用户偏好，Composition API |
| 构建工具 | Vite | 快速开发体验 |
| 语言 | TypeScript | 类型安全 |
| UI框架 | shadcn-vue + Tailwind CSS | 轻量，暗色主题 |
| 状态管理 | 按需引入Pinia | 当前无需全局状态 |

### 5.2 架构决策
| 决策点 | 选择 | 原因 |
|--------|------|------|
| 工具注册 | registry.ts集中管理 | 方便扩展，主页自动读取 |
| 路由生成 | 动态生成 | 新增工具无需手动添加路由 |
| 组件组织 | 按功能分目录 | json-formatter/, timestamp-converter/ |
| 样式变量 | CSS Variables | 主题切换，无框架依赖 |

### 5.3 问题解决记录
| 问题 | 解决方案 | 日期 |
|------|----------|------|
| vue-tsc 1.x 不兼容 Node 24 | 升级到 vue-tsc ^2.0.0 | 2026-03-20 |
| TypeScript路径别名@在类型导入中不生效 | 改用相对路径 | 2026-03-20 |
| main.ts缺少router导入导致router-link组件无法解析 | 添加`import router from './router'`和`app.use(router)` | 2026-03-20 |
| shadcn primary颜色（白色）导致logo变白 | logo使用inline style `color: hsl(239 84% 67%)` | 2026-03-22 |
| 原生select样式与shadcn不一致 | 安装shadcn Select组件替换 | 2026-03-22 |
| Card组件边框使用文字颜色而非border变量 | 添加`@layer base { * { border-color: var(--color-border) } }` | 2026-03-22 |
| 首页导航到工具页时navbar（logo+badge）位移 | 两个原因叠加：① hero section 放在 AppHeader 中用 `v-if` 条件渲染，DOM 增删触发 reflow ② Timestamp 页面内容超出视口出现滚动条，JSON 页面用固定高度不出现，滚动条显隐导致页面宽度变化 ~15px | 2026-03-22 |
| parseJsonTree 解析格式化文本导致数据丢失 | 首次实现用 formatted text 行解析，遇到 `"key": {` 这类行时丢失值，数组项被跳过 | 改为遍历 parsed JSON value 直接计算行号 | 2026-03-24 |
| escape 输出进入 tree view 后 `\n` 变成实际换行 | escapeJson 输出是合法 JSON 字符串值，parseJsonTree 解析成功，JSON.stringify 把 `\n` escape sequence 变成实际换行 | treeRoot 仅在输出以 `{` 或 `[` 开头时激活 | 2026-03-24 |

### 5.4 主题切换设计决策 (2026-03-23)

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 切换方式 | 按钮直接切换（非下拉菜单） | 简洁，仅需亮/暗两种模式 |
| 图标 | lucide-vue-next Sun/Moon | 已安装，符合 shadcn 风格 |
| 存储 | localStorage | 用户偏好持久化 |
| 默认主题 | 暗色 | 保持现有用户体验 |
| CSS 实现 | Tailwind darkMode: 'class' | 已配置，shadcn 官方方案 |

### 5.4 Navbar 导航位移问题详解 (2026-03-22)

**现象：** 从首页点击工具卡片（如时间戳）进入工具页时，顶部 navbar 的 logo 和版本号会短暂位移。JSON 页面不出现此问题。

**根因（两层叠加）：**

1. **DOM 结构不稳定：** 最初 hero section 放在 `AppHeader.vue` 中，用 `v-if="isHome"` 条件渲染。导航时 Vue 增删 DOM 节点触发 reflow，影响 sticky navbar 的渲染。

2. **滚动条显隐：** Timestamp 页面内容多（当前时间 + 转换面板 + 批量转换），用 `min-h-[calc(100vh-120px)]`，内容超出视口出现滚动条。JSON 页面用固定 `h-[calc(100vh-120px)]`，内容不超视口无滚动条。滚动条出现/消失导致页面可用宽度变化约 15px，navbar 内部元素随之位移。

**解决方案（两步）：**

1. **AppHeader 精简为纯 navbar：** hero section 移到 `HomePage.vue` 内部渲染，AppHeader 不再有任何条件逻辑，所有页面 DOM 结构完全相同 → `3191353`

2. **强制滚动条始终存在：** `globals.css` 给 `html, body, #app` 加 `overflow-y: scroll`，内容不超时显示为灰色占位条，页面宽度恒定 → `09e6fe4`

**经验教训：**
- sticky 元素所在的容器应避免 v-if 条件渲染，改用 CSS 控制显示/隐藏
- 多页面应用中，应统一滚动条行为（始终显示或始终隐藏），避免导航时布局抖动
- 固定高度（`h-`）vs 最小高度（`min-h-`）会影响滚动条出现与否，需全局考虑

### 6.1 工具注册机制
**文件：** `src/tools/registry.ts`

```typescript
// 工具定义接口
interface ToolDefinition {
  id: string           // 工具唯一标识
  name: string         // 工具名称
  path: string         // 路由路径
  icon: string         // 图标
  description: string  // 简介
  category: string     // 分类
  component: () => Promise<Component>  // 懒加载组件
}

// 核心函数
- tools: ToolDefinition[]              // 所有已注册工具
- getToolsByCategory(): ToolCategory[] // 按分类分组
- findToolByPath(path): ToolDefinition // 根据路径查找
```

### 6.2 添加新工具步骤
1. 在 `src/tools/` 下创建工具目录
2. 创建工具组件
3. 在 `registry.ts` 中注册工具
4. 自动出现在侧边栏、主页和路由中

---

## 七、环境信息

### 7.1 开发环境
- **Node版本：** v24.13.0
- **npm版本：** （请补充）
- **操作系统：** Windows (win32)
- **工作目录：** E:\llf\projects\tools

### 7.2 常用命令
```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

---

## 八、恢复指南

### 8.1 中断后恢复步骤
1. 检查当前分支：`git branch --show-current`
2. 检查工作区状态：`git status`
3. 查看最后提交：`git log --oneline -5`
4. 安装依赖：`npm install`
5. 验证构建：`npm run build`
6. 继续下一阶段开发

### 8.2 迭代需求步骤
1. 读取本memory文件了解项目状态
2. 读取产品文档：`docs/specs/2026-03-20-devtools-design.md`
3. 读取开发规则：`RULES.md`
4. 创建新的变更记录：`docs/changelog/YYYY-MM-DD-<变更描述>.md`
5. 按照计划继续开发

---

## 九、待办事项

### 高优先级
- [ ] 亮色主题切换功能实现（阶段五）
- [ ] 部署到 Vercel / GitHub Pages

### 中优先级
- [ ] 移动端响应式优化
- [ ] 添加工具搜索功能
- [ ] 性能优化（懒加载、代码分割）

### 低优先级
- [ ] 添加更多工具（Base64、URL编解码、正则测试等）
- [ ] PWA离线支持

---

## 十、联系和参考

### 文档链接
- 产品文档：`docs/specs/2026-03-20-devtools-design.md`
- 开发规则：`RULES.md`
- 实现计划：`docs/superpowers/plans/2026-03-20-phase1-basic-setup.md`
- 变更记录：`docs/changelog/`

### 设计参考
- UI风格：VSCode暗色主题
- 配色方案：见 `main.css` 中的CSS变量

---

*Memory文件结束*
