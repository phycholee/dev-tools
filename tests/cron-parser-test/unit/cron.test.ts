import { describe, it, expect } from 'vitest'
import { validateField, parseCron, getNextRuns, generateCron } from '@/tools/cron-parser/cron'

describe('validateField', () => {
  it('应接受有效的通配符 *', () => {
    expect(validateField('*', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的步长 */5', () => {
    expect(validateField('*/5', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的确切值 30', () => {
    expect(validateField('30', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的范围 1-5', () => {
    expect(validateField('1-5', 'minute')).toEqual({ valid: true })
  })

  it('应接受有效的列表 1,3,5', () => {
    expect(validateField('1,3,5', 'minute')).toEqual({ valid: true })
  })

  it('应拒绝超出范围的值 60（分钟）', () => {
    const result = validateField('60', 'minute')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('范围')
  })

  it('应拒绝非法字符 abc', () => {
    const result = validateField('abc', 'minute')
    expect(result.valid).toBe(false)
  })
})

describe('parseCron', () => {
  it('应解析 5 位 cron 表达式', () => {
    const result = parseCron('*/5 * * * *')
    expect(result.success).toBe(true)
    expect(result.fields).toHaveLength(5)
  })

  it('应解析 6 位 cron 表达式', () => {
    const result = parseCron('0 */5 * * * *')
    expect(result.success).toBe(true)
    expect(result.fields).toHaveLength(6)
  })

  it('应生成正确的描述 - 每5分钟', () => {
    const result = parseCron('*/5 * * * *')
    expect(result.description).toContain('每 5 分钟')
  })

  it('应生成正确的描述 - 每天午夜', () => {
    const result = parseCron('0 0 * * *')
    expect(result.description).toContain('每天')
    expect(result.description).toContain('00:00')
  })

  it('应拒绝空输入', () => {
    const result = parseCron('')
    expect(result.success).toBe(false)
  })

  it('应拒绝非法格式', () => {
    const result = parseCron('invalid')
    expect(result.success).toBe(false)
  })

  it('应拒绝非 5/6 位格式', () => {
    const result = parseCron('* * *')
    expect(result.success).toBe(false)
    expect(result.error).toContain('5 位或 6 位')
  })
})

describe('getNextRuns', () => {
  const baseTime = new Date('2026-03-26T14:32:00')

  it('应计算每分钟执行的下次 5 次时间', () => {
    const runs = getNextRuns('* * * * *', baseTime, 5)
    expect(runs).toHaveLength(5)
    expect(runs[0].getMinutes()).toBe(33) // 下一分钟
  })

  it('应计算每 5 分钟执行的下次时间', () => {
    const runs = getNextRuns('*/5 * * * *', baseTime, 5)
    expect(runs).toHaveLength(5)
    expect(runs[0].getMinutes()).toBe(35) // 14:35
  })

  it('应计算每小时执行的下次时间', () => {
    const runs = getNextRuns('0 * * * *', baseTime, 5)
    expect(runs).toHaveLength(5)
    expect(runs[0].getHours()).toBe(15) // 15:00
  })
})

describe('generateCron', () => {
  it('应从 5 个字段生成 cron', () => {
    expect(generateCron(['*', '*', '*', '*', '*'])).toBe('* * * * *')
  })

  it('应从 6 个字段生成 cron', () => {
    expect(generateCron(['0', '*/5', '*', '*', '*', '*'])).toBe('0 */5 * * * *')
  })
})
