# Project-Specific

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # vue-tsc + build
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E + a11y (Playwright)
npm run test:all     # Unit + E2E
```

No ESLint/Prettier — TypeScript strict mode enforces quality.

## Architecture

**Tool Registry Pattern:** All tools register in [registry.ts](src/tools/registry.ts). Routes auto-generated — no manual route additions.

Each tool: `src/tools/<name>/` with `<Name>.vue` + `<name>.ts` (pure utils). Sub-components as additional `.vue` files.

- **Path alias:** `@/` → `src/`
- **Toast:** `inject<(msg: string) => void>('toast')` from `App.vue`
- **Result pattern:** `{ success: boolean, output: string, error?: string }`
- **CSS:** Tailwind v4, OKLCH colors in [globals.css](src/assets/styles/globals.css), dark mode via class. Use shadcn-vue tokens (`bg-primary`, `text-foreground`). Per-tool `--tool-*` CSS variables.
- **UI:** shadcn-vue convention (`Component.vue` + `index.ts` with `cva()`), built on `reka-ui`
- **Fonts:** Plus Jakarta Sans (UI) + JetBrains Mono (code)

## Code Style

- **TS:** `interface` over `type`, no `any`, JSDoc on utils
- **Vue:** `<script setup lang="ts">`, `defineProps<{...}>()`, never Options API
- **Naming:** PascalCase components, camelCase utils, UPPER_SNAKE constants

## Adding a Tool

1. Create `src/tools/<name>/` with `<Name>.vue` and `<name>.ts`
2. Register in [registry.ts](src/tools/registry.ts): `{ id, name, path, icon (lucide-vue-next), description, category, component: () => import(...), color }`
3. Add `--tool-<id>` CSS variable in [globals.css](src/assets/styles/globals.css)

## Git Commits

`<type>(<scope>): <subject>` — Types: feat, fix, docs, style, refactor, test, chore

## Testing

Tests must pass before completing any task. TDD workflow: unit → e2e → build.

```
tests/<feature>-test/
├── unit/    # Vitest (tests src/tools/**/*.ts)
├── e2e/     # Playwright + axe accessibility
└── visual/  # Screenshot regression
```

**Before changing DOM:** Check existing E2E selectors to avoid breaking them.
