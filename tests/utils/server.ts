import { spawn, ChildProcess } from 'child_process'
import { request } from 'http'

export class DevServer {
  private process: ChildProcess | null = null
  private url: string

  constructor(url: string = 'http://localhost:5173') {
    this.url = url
  }

  async start(): Promise<void> {
    console.log('Starting dev server...')
    
    return new Promise((resolve, reject) => {
      this.process = spawn('npm', ['run', 'dev'], {
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: '0' },
      })

      let output = ''
      
      this.process.stdout?.on('data', (data) => {
        output += data.toString()
        if (output.includes('Local:') || output.includes('localhost:5173')) {
          resolve()
        }
      })

      this.process.stderr?.on('data', (data) => {
        output += data.toString()
      })

      this.process.on('error', reject)

      // Timeout fallback
      setTimeout(() => {
        if (this.process) {
          resolve()
        }
      }, 30000)
    })
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM')
      this.process = null
      console.log('Dev server stopped')
    }
  }

  async healthCheck(maxAttempts: number = 30): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.request(this.url)
        if (response.statusCode === 200) {
          return true
        }
      } catch {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    return false
  }

  private request(url: string): Promise<{ statusCode: number }> {
    return new Promise((resolve, reject) => {
      const req = request(url, (res) => {
        resolve({ statusCode: res.statusCode || 0 })
      })
      req.on('error', reject)
      req.end()
    })
  }
}
