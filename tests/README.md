# Testing Documentation

## Quick Start

```bash
# Install dependencies
npm install

# Install test dependencies
cd tests && npm install && npx playwright install chromium

# Run all tests
npm run test:all

# Run only unit tests
npm run test

# Run only E2E tests
npm run test:e2e

# Run only visual regression tests
npm run test:visual

# Generate test report
npm run test:report
```

## Test Structure

```
tests/
├── config.ts                    # Test configuration
├── utils/                       # Test utilities (server, reporter, screenshot, console)
├── json-formatter-test/         # JSON formatter tests
│   ├── unit/                    # Unit tests (Vitest)
│   ├── e2e/                     # E2E tests (Playwright)
│   ├── visual/                  # Visual regression tests
│   │   └── baseline/           # Baseline screenshots
│   └── axe.config.ts           # Accessibility configuration
├── timestamp-converter-test/    # Timestamp converter tests
│   ├── unit/
│   ├── e2e/
│   ├── visual/
│   │   └── baseline/
│   └── axe.config.ts
├── vitest.config.ts             # Vitest configuration
└── playwright.config.ts         # Playwright configuration (root)
```

## Test Types

### Unit Tests (Vitest)
- Test utility functions in isolation
- Located in `tests/<feature>-test/unit/`
- Run with: `npm run test`

### E2E Tests (Playwright)
- Test page interactions and user flows
- Located in `tests/<feature>-test/e2e/`
- Run with: `npm run test:e2e`

### Visual Regression Tests
- Compare screenshots against baselines
- Located in `tests/<feature>-test/visual/`
- Run with: `npm run test:visual`

### Accessibility Tests (axe-core)
- WCAG 2.1 AA compliance checking
- Located in `tests/<feature>-test/e2e/axe.spec.ts`
- Run with: `npm run test:e2e`

## Adding Tests for New Features

1. Create `tests/<feature>-test/` directory
2. Add unit tests in `unit/`
3. Add E2E tests in `e2e/`
4. Add visual baseline in `visual/baseline/`
5. Configure axe rules in `axe.config.ts`
6. Update `tests/config.ts` to include the new test directory

## CI Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: cd tests && npm install
      - run: npx playwright install chromium
      - run: npm run test:all
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Visual tests failing
```bash
# Update baseline screenshots
cd tests
npx playwright test --grep visual --update-snapshots
```

### Playwright browser not found
```bash
# Install browsers
npx playwright install chromium
```
