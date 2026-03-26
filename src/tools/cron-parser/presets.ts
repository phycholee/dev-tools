export interface CronPreset {
  name: string
  expression: string
  description: string
}

export const presets: CronPreset[] = [
  { name: '每秒', expression: '* * * * * *', description: '每秒执行' },
  { name: '每分钟', expression: '* * * * *', description: '每分钟执行' },
  { name: '每小时', expression: '0 * * * *', description: '每小时整点执行' },
  { name: '每天午夜', expression: '0 0 * * *', description: '每天 00:00 执行' },
  { name: '每周一', expression: '0 0 * * 1', description: '每周一 00:00 执行' },
  { name: '工作日', expression: '0 9 * * 1-5', description: '工作日上午 9 点执行' },
  { name: '每5分钟', expression: '*/5 * * * *', description: '每 5 分钟执行' }
]
