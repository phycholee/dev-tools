import fs from 'fs/promises'
import path from 'path'

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  screenshot?: string
}

interface TestReport {
  timestamp: string
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
  results: TestResult[]
}

export class TestReporter {
  private reportDir: string
  private results: TestResult[] = []
  private startTime: number

  constructor(reportDir: string = 'tests/report') {
    this.reportDir = reportDir
    this.startTime = Date.now()
  }

  addResult(result: TestResult): void {
    this.results.push(result)
  }

  async generate(): Promise<string> {
    await fs.mkdir(this.reportDir, { recursive: true })

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      total: this.results.length,
      passed: this.results.filter((r) => r.status === 'passed').length,
      failed: this.results.filter((r) => r.status === 'failed').length,
      skipped: this.results.filter((r) => r.status === 'skipped').length,
      duration: Date.now() - this.startTime,
      results: this.results,
    }

    await fs.writeFile(
      path.join(this.reportDir, 'results.json'),
      JSON.stringify(report, null, 2)
    )

    const html = this.generateHtml(report)
    await fs.writeFile(path.join(this.reportDir, 'index.html'), html)

    return path.join(this.reportDir, 'index.html')
  }

  private generateHtml(report: TestReport): string {
    const statusColor = (status: string) => {
      switch (status) {
        case 'passed': return '#22c55e'
        case 'failed': return '#ef4444'
        default: return '#f59e0b'
      }
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Report - ${report.timestamp}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; background: #0f172a; color: #e2e8f0; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .card { background: #1e293b; padding: 20px; border-radius: 8px; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #334155; }
    th { background: #1e293b; }
    .status { padding: 4px 8px; border-radius: 4px; }
    img { max-width: 400px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>AI Testing Report</h1>
  <p>Generated: ${report.timestamp}</p>
  
  <div class="summary">
    <div class="card">Total: ${report.total}</div>
    <div class="card passed">Passed: ${report.passed}</div>
    <div class="card failed">Failed: ${report.failed}</div>
    <div class="card">Duration: ${(report.duration / 1000).toFixed(2)}s</div>
  </div>

  <table>
    <thead>
      <tr><th>Test</th><th>Status</th><th>Duration</th><th>Details</th></tr>
    </thead>
    <tbody>
      ${report.results.map((r) => `
        <tr>
          <td>${r.name}</td>
          <td><span class="status" style="background: ${statusColor(r.status)}">${r.status}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.error || ''} ${r.screenshot ? `<img src="${r.screenshot}"/>` : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`
  }
}
