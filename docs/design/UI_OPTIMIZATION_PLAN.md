# UI Optimization Plan

Generated: 2026-04-10

---

## CRITICAL - Accessibility (Batch 1)

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 1 | Missing `<label>` associations on inputs | TimestampConverter, CronParser, RegexTester | Using `placeholder` instead of `label`; screen readers cannot associate |
| 2 | Error states missing `role="alert"` / `aria-live` | All tool pages | Dynamic errors not announced by screen readers |
| 3 | Sidebar active link missing `aria-current="page"` | AppSidebar.vue | Visual highlight only, no semantic indicator |
| 4 | JSON editor resize divider has no keyboard support | JsonFormatter.vue | Missing `role="separator"`, `aria-orientation`, arrow keys |
| 5 | Header logo uses `<div>` + `@click` as link | AppHeader.vue:7 | Non-semantic; keyboard users cannot focus |
| 6 | Toast missing `aria-live="polite"` | AppToast.vue | Toast messages not announced by screen readers |
| 7 | Regex highlight uses transparent text | RegexHighlight.vue | `text-transparent` makes text invisible; low-vision users see nothing if overlay fails |

## HIGH - Theme/Consistency Bugs (Batch 2)

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 8 | Dark mode CSS variables duplicated & inconsistent | globals.css | `prefers-color-scheme` and `.dark` repeat ~60 lines; `--tool-base64` differs between them |
| 9 | CodeEditor hardcoded colors not theme-aware | CodeEditor.vue | Expand/collapse buttons use hardcoded `#00cfe8`/`#ea5455` |
| 10 | Homepage heading doesn't use design system font-size | HomePage.vue:7 | `text-5xl`/`text-6xl` bypasses `--text-display` variable |
| 11 | Sidebar icon vs page icon mismatch | registry.ts vs RegexTester.vue | Sidebar uses `Regex`, page uses `TextSearch` |
| 12 | Tool description text inconsistency | registry.ts vs tool pages | e.g. regex-tester: "正则表达式匹配" vs "正则匹配、高亮工具" |

## HIGH - Responsive/Layout Issues (Batch 3)

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 13 | Sidebar has no mobile adaptation | AppSidebar.vue | Fixed 240px width, no hamburger/collapse on small screens |
| 14 | Hardcoded magic-number heights | Multiple tools | `h-[calc(100vh-80px)]`/`min-h-[calc(100vh-120px)]` depend on fixed header height |
| 15 | JSON dual-pane editor doesn't fit small screens | JsonFormatter.vue | Min width 400px+ exceeds phone viewports |

## MEDIUM - Interaction/UX Issues (Batch 4)

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 16 | Clipboard copy code duplicated 4 times | Json/Timestamp/Url/Base64 tools | Should extract as shared composable |
| 17 | CronParser copy has no toast notification | CronParser.vue | All other tools show toast after copy |
| 18 | Toast doesn't support manual dismiss or queue | AppToast.vue | Rapid actions cause messages to overwrite each other |
| 19 | Theme toggle flash (FOUC) | ToggleTheme.vue | Theme applied in `onMounted`, causing flash on load |
| 20 | TimestampConverter initially shows 0 | TimestampConverter.vue | Seconds/milliseconds display 0 before `onMounted` |
| 21 | UrlCodec has no empty state prompt | UrlCodec.vue | Results area is blank on initial load |

## MEDIUM - Performance Issues (Batch 5)

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 22 | ResizeObserver not disconnected in onUnmounted | CodeEditor.vue | Memory leak |
| 23 | RegexHighlight scroll sync not throttled | RegexHighlight.vue | Every scroll event triggers update |
| 24 | ToolCard uses `transition-all` | ToolCard.vue | Transitions all properties; should scope to shadow/transform |

## LOW - Visual/Code Quality (Batch 6)

| # | Issue | Location | Detail |
|---|-------|----------|--------|
| 25 | CronParser help tip padding inconsistent | CronParser.vue | Uses `p-4`, other tools use `p-3` |
| 26 | Button `ghost` variant `hover:scale-100` is a no-op | button/index.ts | Likely leftover code |
| 27 | Homepage decorative background not marked `aria-hidden` | HomePage.vue | Assistive tech may misinterpret overlay |
| 28 | Regex highlight layer & textarea double border | RegexHighlight.vue | Two 1px borders stack to 2px |
| 29 | ToolCard icon area too large (80x80px) | ToolCard.vue | Disproportionate to card size |

---

## Execution Order

1. **Batch 1 (CRITICAL)**: #1-7 accessibility fixes
2. **Batch 2 (HIGH)**: #8-12 theme/consistency fixes
3. **Batch 3 (HIGH)**: #13-15 responsive/layout fixes
4. **Batch 4 (MEDIUM)**: #16-21 interaction/UX fixes
5. **Batch 5 (MEDIUM)**: #22-24 performance fixes
6. **Batch 6 (LOW)**: #25-29 visual/code quality fixes
