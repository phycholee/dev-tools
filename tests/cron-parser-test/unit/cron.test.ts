import { describe, it, expect } from 'vitest'
import { validateField, parseCron, generateCron, getNextRuns } from '../../../src/tools/cron-parser/cron'

describe('cron-parser basic API', () => {
  it('validates simple field values', () => {
    expect(validateField('*', 'minute').valid).toBe(true)
    expect(validateField('*/5', 'second').valid).toBe(true)
    expect(validateField('60', 'minute').valid).toBe(false)
    expect(validateField('1-12', 'month').valid).toBe(true)
    expect(validateField('13-32', 'month').valid).toBe(false)
    expect(validateField('1,2,3', 'weekday').valid).toBe(true)
  })

  it('parses 6-field cron and 5-field cron', () => {
    const res6 = parseCron('*/5 * * * * *')
    expect(res6.success).toBe(true)
    expect(res6.fields?.length).toBe(6)

    const res5 = parseCron('* * * * *')
    expect(res5.success).toBe(true)
    expect(res5.fields?.length).toBe(6) // still returns 6 fields in internal structure
  })

  it('generates cron string from fields', () => {
    const cron = generateCron(['*/5', '*', '*', '*', '*', '*'])
    expect(cron).toBe('*/5 * * * * *')
  })

  it('computes next 5 runs for a simple schedule', () => {
    // base time: 12:03:25 with arbitrary date to ensure deterministic seconds
    const base = new Date(2026, 2, 26, 12, 3, 25) // March is month 2 in JS Date
    const runs = getNextRuns('*/5 * * * * *', base, 5)
    expect(runs.length).toBe(5)
    // expect 30s,35s,40s,45s,50s as first five next runs
    const expected = [30, 35, 40, 45, 50]
    for (let i = 0; i < 5; i++) {
      expect(runs[i].getSeconds()).toBe(expected[i])
      expect(runs[i].getHours()).toBe(12)
      expect(runs[i].getMinutes()).toBe(3)
    }
  })
})
