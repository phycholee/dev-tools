export const testConfig = {
  // Development server configuration
  devServer: {
    url: 'http://localhost:5173',
    timeout: 60000,
    healthCheckInterval: 1000,
    startupTimeout: 120000,
  },

  // Browser configuration
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    slowMo: 0,
  },

  // Test timeout configuration
  timeouts: {
    unit: 30000,
    e2e: 60000,
    visual: 30000,
    axe: 30000,
  },

  // Visual comparison threshold
  visual: {
    diffThreshold: 0.01, // 1% pixel difference
    baselineDir: 'tests/visual/baseline',
    outputDir: 'tests/report/visual',
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    intervals: [5000, 10000, 15000],
  },

  // Test directories per feature
  testDirs: [
    'json-formatter-test',
    'timestamp-converter-test',
    'url-codec-test',
  ],
}
