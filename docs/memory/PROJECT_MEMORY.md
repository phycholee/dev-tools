# DevTools 项目 - AI 长期记忆

> 最后更新：2026-03-21（修复main.ts router注册问题）  
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

**Git提交：**
```
5e19201 fix(timestamp): fix unused timezone parameter in createDateFromComponents
a29b8ab feat(timestamp): implement full timestamp converter page with all features
0bacb20 feat(timestamp): add timestamp utility functions (convert, format, batch)
```

### 3.4 阶段四：优化和部署 ⏳ 待开始

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
│   │   │   ├── AppHeader.vue     # 顶部导航（logo + 版本号）
│   │   │   ├── AppSidebar.vue    # 工具列表侧边栏
│   │   │   └── AppLayout.vue     # 布局容器
│   │   └── common/
│   │       └── ToolCard.vue      # 工具卡片组件
│   ├── pages/
│   │   └── HomePage.vue          # 主页面 - 工具列表
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

---

## 六、关键文件说明

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
- [ ] 实现JSON格式化工具（阶段二）
- [ ] 实现时间戳转换工具（阶段三）

### 中优先级
- [ ] 移动端响应式优化
- [ ] 添加工具搜索功能

### 低优先级
- [ ] 添加更多工具（Base64、URL编解码等）
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
