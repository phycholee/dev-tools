import type { CronFormat } from './cron'

export interface CronPreset {
  name: string
  expression: string
  description: string
}

// 每种格式的预设
export const presetsByFormat: Record<CronFormat, CronPreset[]> = {
  'linux-5': [
    { name: '每分钟', expression: '* * * * *', description: '每分钟执行' },
    { name: '每小时', expression: '0 * * * *', description: '每小时整点执行' },
    { name: '每天午夜', expression: '0 0 * * *', description: '每天 00:00 执行' },
    { name: '每周一', expression: '0 0 * * 1', description: '每周一 00:00 执行' },
    { name: '工作日', expression: '0 9 * * 1-5', description: '工作日上午 9 点执行' },
    { name: '每5分钟', expression: '*/5 * * * *', description: '每 5 分钟执行' },
    { name: '每10分钟', expression: '*/10 * * * *', description: '每 10 分钟执行' },
    { name: '每月1号', expression: '0 0 1 * *', description: '每月 1 号 00:00 执行' },
  ],
  'linux-6': [
    { name: '每秒', expression: '* * * * * *', description: '每秒执行' },
    { name: '每分钟', expression: '0 * * * * *', description: '每分钟执行' },
    { name: '每小时', expression: '0 0 * * * *', description: '每小时整点执行' },
    { name: '每天午夜', expression: '0 0 0 * * *', description: '每天 00:00 执行' },
    { name: '每周一', expression: '0 0 0 * * 1', description: '每周一 00:00 执行' },
    { name: '工作日', expression: '0 0 9 * * 1-5', description: '工作日上午 9 点执行' },
    { name: '每5分钟', expression: '0 */5 * * * *', description: '每 5 分钟执行' },
    { name: '每10分钟', expression: '0 */10 * * * *', description: '每 10 分钟执行' },
  ],
  'quartz-6': [
    { name: '每秒', expression: '* * * * * ?', description: '每秒执行' },
    { name: '每分钟', expression: '0 * * * * ?', description: '每分钟执行' },
    { name: '每小时', expression: '0 0 * * * ?', description: '每小时整点执行' },
    { name: '每天午夜', expression: '0 0 0 * * ?', description: '每天 00:00 执行' },
    { name: '每周一', expression: '0 0 0 ? * 2', description: '每周一 00:00 执行 (1=SUN)' },
    { name: '工作日', expression: '0 0 9 ? * 2-6', description: '工作日上午 9 点执行' },
    { name: '每5分钟', expression: '0 0/5 * * * ?', description: '每 5 分钟执行' },
    { name: '每月最后一天', expression: '0 0 0 L * ?', description: '每月最后一天 00:00 执行' },
    { name: '每月1号', expression: '0 0 0 1 * ?', description: '每月 1 号 00:00 执行' },
    { name: '每月第一个周五', expression: '0 0 0 ? * 6#1', description: '每月第一个周五 00:00 执行' },
  ],
  'quartz-7': [
    { name: '每秒', expression: '* * * * * ? *', description: '每秒执行' },
    { name: '每分钟', expression: '0 * * * * ? *', description: '每分钟执行' },
    { name: '每小时', expression: '0 0 * * * ? *', description: '每小时整点执行' },
    { name: '每天午夜', expression: '0 0 0 * * ? *', description: '每天 00:00 执行' },
    { name: '每周一', expression: '0 0 0 ? * 2 *', description: '每周一 00:00 执行 (1=SUN)' },
    { name: '工作日', expression: '0 0 9 ? * 2-6 *', description: '工作日上午 9 点执行' },
    { name: '每5分钟', expression: '0 0/5 * * * ? *', description: '每 5 分钟执行' },
    { name: '每月最后一天', expression: '0 0 0 L * ? *', description: '每月最后一天 00:00 执行' },
    { name: '每月1号', expression: '0 0 0 1 * ? *', description: '每月 1 号 00:00 执行' },
    { name: '每月第一个周五', expression: '0 0 0 ? * 6#1 *', description: '每月第一个周五 00:00 执行' },
    { name: '2026年每天', expression: '0 0 0 * * ? 2026', description: '2026 年每天 00:00 执行' },
  ],
}

// 默认导出兼容旧代码
export const presets: CronPreset[] = presetsByFormat['linux-6']
