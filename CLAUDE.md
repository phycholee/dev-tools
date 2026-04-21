# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

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
