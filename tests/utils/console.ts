import { Page } from '@playwright/test'

export interface ConsoleMessage {
  type: 'error' | 'warn' | 'log' | 'info'
  text: string
  location?: string
}

export class ConsoleMonitor {
  private messages: ConsoleMessage[] = []
  private page: Page | null = null

  attach(page: Page): void {
    this.page = page
    this.messages = []

    page.on('console', (msg) => {
      this.messages.push({
        type: msg.type() as ConsoleMessage['type'],
        text: msg.text(),
        location: msg.location()?.url,
      })
    })

    page.on('pageerror', (error) => {
      this.messages.push({
        type: 'error',
        text: error.message,
        location: error.stack,
      })
    })
  }

  getErrors(): ConsoleMessage[] {
    return this.messages.filter(
      (m) => m.type === 'error' || m.type === 'warn'
    )
  }

  hasErrors(): boolean {
    return this.getErrors().length > 0
  }

  report(): string {
    const errors = this.getErrors()
    if (errors.length === 0) return 'No console errors'

    return errors.map((e) => `[${e.type.toUpperCase()}] ${e.text}`).join('\n')
  }

  clear(): void {
    this.messages = []
  }
}
