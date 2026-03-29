// tests/base64-codec-test/axe.config.ts
import type { AxeResults } from 'axe-core'

export const axeConfig = {
  allowedRules: [
    'color-contrast',
    'html-has-lang',
    'image-alt',
    'link-name',
    'button-name',
    'label',
    'region',
  ],
  excludedRules: [] as string[],
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
}

export function filterAxeResults(results: AxeResults): AxeResults {
  return {
    ...results,
    violations: results.violations.filter(
      (v) => !axeConfig.excludedRules.includes(v.id)
    ),
    passes: results.passes.filter(
      (p) => !axeConfig.excludedRules.includes(p.id)
    ),
  }
}
