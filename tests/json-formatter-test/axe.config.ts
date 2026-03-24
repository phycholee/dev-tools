import { AxeResults } from '@axe-core/playwright'

export const axeConfig = {
  // WCAG 2.1 AA compliance level
  allowedRules: [
    'color-contrast',
    'html-has-lang',
    'image-alt',
    'link-name',
    'button-name',
    'label',
    'region',
  ],
  // Excluded rules for this specific page
  excludedRules: [],

  // Tags to include
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
}

export function filterAxeResults(results: AxeResults): AxeResults {
  const violations = results.violations.filter((v) =>
    axeConfig.allowedRules.includes(v.id) ||
    !axeConfig.excludedRules.includes(v.id)
  )

  return {
    ...results,
    violations,
    passes: results.passes.filter((p) =>
      axeConfig.allowedRules.includes(p.id) ||
      !axeConfig.excludedRules.includes(p.id)
    ),
  }
}
