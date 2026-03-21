# 变更记录 - 2026-03-21

## 变更类型
- [x] 重构

## 变更描述
UI 框架从纯 CSS Variables 迁移到 shadcn-vue + Tailwind CSS，采用 Vercel/Geist 风格设计系统。

## 变更原因
- 统一组件库，减少自定义 CSS 维护成本
- 获得高质量、可访问的 UI 组件
- 支持更灵活的主题定制（shadcn-vue CSS 变量体系）
- 为后续功能开发（JSON格式化、时间戳转换）提供更好的 UI 基础

## 影响范围
- 影响的文件/模块：所有布局组件（AppHeader、AppSidebar、AppLayout）、ToolCard、HomePage、全局样式
- 是否需要更新文档：是（产品文档版本号更新）
- 是否需要更新测试：否（无单元测试）

## 相关文档
- 产品文档：docs/specs/2026-03-20-devtools-design.md (v1.2)
