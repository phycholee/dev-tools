# DevTools - Agent Guidelines

> Vue 3 developer toolbox. Dark theme (Vercel style). Data stays client-side.

## Build & Run

```bash
npm install
npm run dev          # Start dev server (Vite)
npm run build        # Type check (vue-tsc) + build
npm run preview      # Preview production build
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:all     # All tests
```

**No eslint/prettier configured.** TypeScript strict mode enforces code quality.

## Project Structure

```
src/
├── tools/<tool-name>/        # Each tool: Component.vue + util.ts
│   ├── JsonFormatter.vue
│   └── json.ts
├── components/
│   ├── ui/                   # shadcn-vue primitives (button, card, badge, select)
│   ├── common/               # App-level shared components
│   └── layout/               # AppLayout, AppHeader, AppSidebar
├── lib/utils.ts              # cn() helper (clsx + tailwind-merge)
├── types/tool.ts             # ToolDefinition, ToolCategory interfaces
├── pages/                    # Route page components
├── router/index.ts           # Auto-generates routes from tool registry
├── tools/registry.ts         # Tool definitions array
└── assets/styles/globals.css # Tailwind v4 theme + CSS variables
```

**Path alias:** `@/` → `src/`

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Vue 3.4 + Composition API (`<script setup lang="ts">`) |
| Build | Vite 5 + `@vitejs/plugin-vue` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + CSS variables |
| UI Components | shadcn-vue (reka-ui primitives) + class-variance-authority |
| Router | vue-router 4 |
| Composables | @vueuse/core |
| Toast | vue-sonner |

## Code Style

### TypeScript

- **Strict mode enabled** — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- All function parameters and return values **must** have type declarations
- Avoid `any` — use concrete types or generics
- Use `interface` for object structures, not `type` (unless union types)
- Result pattern for operations that can fail:
  ```typescript
  export interface OperationResult {
    success: boolean
    output: string
    error?: string
  }
  ```

### Vue Components

- Use `<script setup lang="ts">` — never Options API
- Props via `defineProps<{ ... }>()` with TypeScript
- Path imports: `import { Button } from '@/components/ui/button'`
- Inject global services: `const toast = inject<(msg: string) => void>('toast')`
- Use `ref()`, `watch()`, `computed()` from Vue

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `JsonFormatter.vue` |
| Utility files | camelCase | `json.ts`, `timestamp.ts` |
| Variables/functions | camelCase | `formatJson`, `isValidJson` |
| Constants | UPPER_SNAKE_CASE | `MAX_INPUT_SIZE` |
| CSS classes | kebab-case | `tool-card`, `json-output` |
| Interfaces | PascalCase | `ToolDefinition`, `JsonFormatResult` |

### Styling

- Use Tailwind utility classes exclusively — no custom CSS in components unless necessary
- `cn()` helper from `@/lib/utils` for conditional/merged classes
- shadcn-vue color tokens: `bg-primary`, `text-foreground`, `bg-destructive`, etc.
- Responsive: `grid-cols-1 md:grid-cols-2` pattern
- Animations: `transition-all duration-150`, `hover:scale-105`

### Comments

- JSDoc on all utility functions:
  ```typescript
  /**
   * Format JSON string with indentation
   * @param input - Raw JSON string
   * @param indent - Spaces per indent level (default: 2)
   * @returns Formatted result or error
   */
  ```
- Component: brief functional description at top
- Complex logic: inline comments explaining the "why"

## Adding a New Tool

1. Create `src/tools/<tool-name>/` directory
2. Add `<ToolName>.vue` component and `<tool-name>.ts` utility
3. Register in `src/tools/registry.ts`:
   ```typescript
   {
     id: 'tool-id',
     name: '工具名称',
     path: '/tool-path',
     icon: '🎯',
     description: '工具描述',
     category: '分类名',
     component: () => import('./tool-name/ToolName.vue'),
     color: '#6366f1'
   }
   ```
4. Route auto-generated from registry — no manual router config needed

## Git Conventions

```bash
# Commit format
<type>(<scope>): <subject>

# Types: feat, fix, docs, style, refactor, test, chore
# Scope: tool name or module (json, timestamp, layout, etc.)

# Examples
git commit -m "feat(json): add JSON escape/unescape"
git commit -m "fix(timestamp): handle millisecond detection"
```

## UI Component Pattern (shadcn-vue)

Components in `src/components/ui/` follow shadcn-vue convention:
- `Component.vue` — template + script
- `index.ts` — exports component + variants via `cva()`
- Use `reka-ui` primitives for accessibility
- Variants managed by `class-variance-authority`

```typescript
// index.ts pattern
import { cva } from "class-variance-authority"
export { default as Button } from "./Button.vue"
export const buttonVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" }
})
```

## AI Testing Workflow (Required)

Every AI development task MUST follow this mandatory workflow:

### ⚠️ MANDATORY: Design → Develop → Test → Complete

**NO task is complete without ALL phases passing.**

```
1. 需求分析 → 2. 设计 → 3. 实现 → 4. 测试 → 5. 完成
       ↑                              ↓
       └──── 测试失败则回到实现 ────────┘
```

### Phase 1: Design (BEFORE any code)

- [ ] 理解需求，确认边界条件
- [ ] 检查现有代码模式和 E2E 测试选择器
- [ ] 确认改动不会破坏现有测试
- [ ] 如有歧义，必须先问用户

### Phase 2: Develop (TDD mandatory)

- [ ] 先写单元测试（红阶段：确认失败）
- [ ] 实现功能代码
- [ ] 跑单元测试（绿阶段：确认通过）
- [ ] 跑 build 确认编译通过

### Phase 3: Test (BEFORE claiming complete)

- [ ] `npm run test` — 全部单元测试通过
- [ ] `npm run test:e2e` — 全部 E2E 测试通过
- [ ] `npm run build` — 编译通过
- [ ] 如有失败：修复 → 重新测试 → 不跳过任何测试

### ⛔ Hard Rules

1. **不测试不交付** — 跑完测试才算完成
2. **不跳过测试** — 失败必须修复，不删除测试
3. **不伪造结果** — 测试输出必须真实
4. **改动 DOM 前检查 E2E 选择器** — 确认兼容性

### Testing Phase (Mandatory)

After completing feature implementation, AI MUST execute the full testing workflow before marking the task as complete:

1. **启动开发服务器**: `npm run dev`
2. **运行单元测试**: Vitest for utility functions
3. **运行 E2E 测试**: Playwright for page interactions
4. **视觉回归测试**: Screenshot comparison
5. **Console 错误检测**: Monitor console errors and network failures
6. **无障碍审计**: axe-core for accessibility issues
7. **生成测试报告**: Terminal output + HTML report + screenshots on failure

### Test Failure Handling

- Auto-retry up to 3 times on failure
- Report detailed error with screenshots and logs if retry fails
- **NEVER skip tests or fake test results**

### Test Directory Structure

```
tests/
├── config.ts              # Test configuration
├── utils/                 # Test utilities
├── <feature>-test/       # One directory per feature
│   ├── unit/             # Unit tests (Vitest)
│   ├── e2e/              # E2E tests (Playwright)
│   ├── visual/           # Visual regression
│   │   └── baseline/    # Baseline screenshots
│   └── axe.config.ts    # Accessibility config
```

See `docs/superpowers/specs/2026-03-23-ai-testing-workflow-design.md` for detailed testing workflow documentation.

## Rules Reference

See `RULES.md` for comprehensive project rules including:
- Change log requirements (`docs/changelog/`)
- Product spec versioning (`docs/specs/`)
- Development workflow checklist
- Memory file maintenance (`docs/memory/PROJECT_MEMORY.md`)
