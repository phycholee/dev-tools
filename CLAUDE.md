# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm install
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Type check (vue-tsc) then build
npm run preview      # Preview production build

# Testing (tests/ is a separate workspace with its own node_modules)
npm run test              # Unit tests only (Vitest)
npm run test:e2e          # E2E + accessibility (Playwright, auto-starts dev server)
npm run test:visual       # Visual regression screenshots
npm run test:all          # Unit + E2E
npm run test:report       # Generate HTML report

# Single test (run from tests/ directory)
cd tests && npx vitest run <feature>-test/unit/<file>.test.ts    # single unit test
cd tests && npx playwright test <feature>-test/e2e/<file>.spec.ts # single e2e test
```

No ESLint/Prettier — TypeScript strict mode enforces code quality.

## Architecture

**Tool Registry Pattern:** The central pattern for everything. All tools register in [src/tools/registry.ts](src/tools/registry.ts). The router auto-generates routes from this registry — no manual route additions needed.

Each tool lives in `src/tools/<tool-name>/` with:
- `<ToolName>.vue` — page component
- `<tool-name>.ts` — pure utility functions (no side effects)
- Additional `.vue` files for sub-components (e.g., `CodeEditor.vue`, `RegexHighlight.vue`)

**Path alias:** `@/` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

**Global Toast:** `App.vue` provides a `toast` function via `provide/inject`. Tool components call it via `inject<(msg: string) => void>('toast')`.

**Result Pattern** for fallible operations:
```typescript
export interface OperationResult {
  success: boolean
  output: string
  error?: string
}
```

**CSS Theme:** Tailwind v4 via `@tailwindcss/vite`. Theme defined in [src/assets/styles/globals.css](src/assets/styles/globals.css) using **OKLCH color system** (not HSL) with CSS custom properties. Dark mode via `darkMode: 'class'`. Use shadcn-vue color tokens (`bg-primary`, `text-foreground`, `bg-destructive`) and `cn()` from `@/lib/utils` for conditional classes. Per-tool color tokens exist as `--tool-*` CSS variables (e.g., `--tool-json`, `--tool-timestamp`).

**UI Components:** `src/components/ui/` follows shadcn-vue convention — each component has `Component.vue` + `index.ts` exporting the component and `cva()` variants. Built on `reka-ui` primitives.

**Layout:** `AppLayout.vue` wraps content with `AppHeader.vue`. `AppSidebar.vue` exists but is not wired into the current layout.

**Fonts:** Plus Jakarta Sans (UI) + JetBrains Mono (code), loaded in globals.css.

## Code Style

**TypeScript:** `interface` over `type` (unless unions). All function params/returns must be typed. No `any`. JSDoc on all utility functions.

**Vue:** `<script setup lang="ts">` always. Props via `defineProps<{ ... }>()`. Never Options API.

**Naming:** PascalCase components, camelCase util files/functions, `UPPER_SNAKE_CASE` constants, PascalCase interfaces.

## Adding a New Tool

1. Create `src/tools/<tool-name>/` with `<ToolName>.vue` and `<tool-name>.ts`
2. Register in [src/tools/registry.ts](src/tools/registry.ts):
   ```typescript
   {
     id: 'tool-id',
     name: '工具名称',
     path: '/tool-path',
     icon: LucideIconComponent,  // Import from 'lucide-vue-next', not emoji
     description: '工具描述',
     category: '分类名',
     component: () => import('./tool-name/ToolName.vue'),
     color: '#6366f1'
   }
   ```
3. Add a `--tool-<id>` CSS variable in [globals.css](src/assets/styles/globals.css) for the tool card accent color
4. Route is auto-generated — done.

## Git Commits

```
<type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, test, chore
# Scope: tool name or module (json, timestamp, layout, etc.)
```

## Testing Requirements

**No task is complete without tests passing.** Mandatory workflow:

1. Write unit tests first (TDD red → green)
2. Run `npm run test` — all unit tests must pass
3. Run `npm run test:e2e` — all E2E tests must pass
4. Run `npm run build` — must compile without errors
5. Never skip tests or delete failing tests — fix them

**Test structure** (separate workspace in `tests/`, with its own `package.json`):
```
tests/<feature>-test/
├── unit/         # Vitest — tests src/tools/**/*.ts directly
├── e2e/          # Playwright — browser interaction + axe accessibility
└── visual/       # Screenshot regression (baseline/ subdirectory)
```

**Before changing DOM elements:** Check existing E2E selectors in `tests/` to avoid breaking them.

## Key References

- [AGENTS.md](AGENTS.md) — full project guidelines (source of truth for conventions)
- [RULES.md](RULES.md) — changelog, spec versioning, workflow checklist, memory file protocol
- [docs/memory/PROJECT_MEMORY.md](docs/memory/PROJECT_MEMORY.md) — project history and backlog