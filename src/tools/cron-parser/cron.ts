// Cron parser utilities
// Supports 5-field (minute hour day month weekday) and 6-field (second minute hour day month weekday) expressions.
// Provides: validateField, parseCron, generateCron, getNextRuns

export type FieldType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'weekday'

export interface CronField {
  value: string
  label: string        // 中文标签：秒、分、时、日、月、周
  description: string  // 中文描述
  valid: boolean
  error?: string
}

export interface CronParseResult {
  success: boolean
  fields?: CronField[]
  description?: string
  nextRuns?: Date[]
  error?: string
}

// Helper range definitions per field
const FIELD_RANGES: Record<FieldType, { min: number; max: number; label: string }> = {
  second: { min: 0, max: 59, label: '秒' },
  minute: { min: 0, max: 59, label: '分' },
  hour: { min: 0, max: 23, label: '时' },
  day: { min: 1, max: 31, label: '日' },
  month: { min: 1, max: 12, label: '月' },
  weekday: { min: 0, max: 6, label: '周' }, // 0 = 周日
}

// Note: helper utilities like clamp/parseSingleValue are not required for the public API
// and were removed to satisfy tree-shaking and avoid unused symbols.

// Validate a single field value string for a given field type
export function validateField(value: string, fieldType: FieldType): { valid: boolean; error?: string } {
  const { min, max } = FIELD_RANGES[fieldType]
  // empty string is invalid
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'Empty field' }
  }

  // helper to validate numeric in range
  const inRange = (n: number) => n >= min && n <= max

  // wildcard
  if (value === '*') return { valid: true }

  // list separated by comma
  const parts = value.split(',')
  for (const part of parts) {
    const p = part.trim()
    if (p.length === 0) return { valid: false, error: 'Invalid token in list' }
    // stepping
    if (p.includes('/')) {
      const [base, stepStr] = p.split('/')
      const step = Number(stepStr)
      if (!Number.isFinite(step) || step <= 0) {
        return { valid: false, error: 'Invalid step' }
      }
      if (base === '*') {
        // e.g. */5
        // all multiples of step from min to max
        // always valid if step is positive
        continue
      } else if (base.includes('-')) {
        const [aStr, bStr] = base.split('-')
        const a = Number(aStr), b = Number(bStr)
        if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) {
          return { valid: false, error: 'Invalid range in stepping' }
        }
        if (!(a >= min && b <= max)) {
          return { valid: false, error: 'Value out of range' }
        }
        continue
      } else {
        // A/B form
        const a = Number(base)
        if (!Number.isFinite(a) || a < min || a > max) {
          return { valid: false, error: 'Value out of range' }
        }
        continue
      }
    }
    // range
    if (p.includes('-')) {
      const [aStr, bStr] = p.split('-')
      const a = Number(aStr), b = Number(bStr)
      if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) {
        return { valid: false, error: 'Invalid range' }
      }
      if (a < min || b > max) return { valid: false, error: 'Value out of range' }
      continue
    }
    // single value
    const val = Number(p)
    if (!Number.isFinite(val) || !inRange(val)) {
      return { valid: false, error: 'Value out of range' }
    }
  }
  return { valid: true }
}

function describeValue(fieldType: FieldType, value: string): string {
  const { label } = FIELD_RANGES[fieldType]
  // 通配符
  if (value === '*') {
    return `每${label}`
  }
  // 步长 */N
  if (value.startsWith('*/')) {
    const step = value.slice(2)
    return `每${step}${label}`
  }
  // 范围 N-M
  if (value.includes('-') && !value.includes('/')) {
    return `${value}范围`
  }
  // 范围+步长 N-M/O
  if (value.includes('-') && value.includes('/')) {
    return `${value}`
  }
  // 列表 N,M,O
  if (value.includes(',')) {
    return `${value}`
  }
  // 单个值
  return `第${value}${label}`
}

export function parseCron(expression: string, baseTime?: Date): CronParseResult {
  // Explicitly acknowledge baseTime to avoid unused-parameter warnings in some runners
  void baseTime
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) {
    return { success: false, error: 'Invalid cron expression length' }
  }
  // If 5 fields, prepend a 0 for seconds
  const fields6 = parts.length === 5 ? ['0', ...parts] : parts

  const fieldNames: FieldType[] = ['second', 'minute', 'hour', 'day', 'month', 'weekday']
  const cronFields: CronField[] = []
  let allValid = true
  let descriptionParts: string[] = []

  for (let i = 0; i < fieldNames.length; i++) {
    const value = fields6[i]
    const type = fieldNames[i]
    const v = validateField(value, type)
    const { label } = FIELD_RANGES[type]  // 使用中文标签
    const field: CronField = {
      value,
      label,
      description: describeValue(type, value),
      valid: v.valid,
      error: v.error,
    }
    cronFields.push(field)
    if (!v.valid) {
      allValid = false
    }
    descriptionParts.push(field.description)
  }

  const description = descriptionParts.join(' | ')
  const result: CronParseResult = {
    success: allValid,
    fields: cronFields,
    description,
  }
  // If all fields are valid, pre-compute the next 5 run times from the parsed fields
  // This avoids re-parsing the expression and ensures nextRuns is available
  // for downstream consumers without additional work.
  if (allValid) {
    const nextRunsFromFields: Date[] = []
    let t = baseTime ? new Date(baseTime.getTime()) : new Date()
    // Start strictly after the base time
    t = new Date(t.getTime() + 1000)
    // Collect next 5 matching schedules
    while (nextRunsFromFields.length < 5) {
      let matchesAll = true
      for (let i = 0; i < fieldNames.length; i++) {
        const fieldVal = cronFields[i].value
        const { min, max } = FIELD_RANGES[fieldNames[i]]
        let currentVal: number
        switch (i) {
          case 0: currentVal = t.getSeconds(); break
          case 1: currentVal = t.getMinutes(); break
          case 2: currentVal = t.getHours(); break
          case 3: currentVal = t.getDate(); break
          case 4: currentVal = t.getMonth() + 1; break
          case 5: currentVal = t.getDay(); break
          default: currentVal = 0
        }
        if (!dateMatchesField(currentVal, fieldVal, min, max)) {
          matchesAll = false
          break
        }
      }
      if (matchesAll) {
        nextRunsFromFields.push(new Date(t.getTime()))
      }
      t = new Date(t.getTime() + 1000)
    }
    ;(result as CronParseResult).nextRuns = nextRunsFromFields
  }
  return result
}

export function generateCron(fields: string[]): string {
  // Simply join the provided fields with spaces. If 5 fields are given, return 5-field expression.
  // If 6 fields are given, return 6-field expression.
  return fields.join(' ')
}

function dateMatchesField(value: number, fieldValue: string, min: number, max: number): boolean {
  // value is the numeric field from a Date (0-based for month etc handled elsewhere)
  const v = value
  if (fieldValue === '*') return true
  if (fieldValue.includes('/')) {
    const [base, stepStr] = fieldValue.split('/')
    const step = Number(stepStr)
    if (base === '*') {
      return v % step === 0
    }
    if (base.includes('-')) {
      const [aStr, bStr] = base.split('-')
      const a = Number(aStr), b = Number(bStr)
      if (v < a || v > b) return false
      return ((v - a) % step) === 0
    } else {
      const a = Number(base)
      if (v < min || v > max) return false
      // treat as a starting point stepping by step
      return ((v - a) % step) === 0
    }
  }
  if (fieldValue.includes('-')) {
    const [aStr, bStr] = fieldValue.split('-')
    const a = Number(aStr), b = Number(bStr)
    return v >= a && v <= b
  }
  if (fieldValue.includes(',')) {
    const parts = fieldValue.split(',').map(s => Number(s.trim()))
    return parts.includes(v)
  }
  const single = Number(fieldValue)
  return v === single
}

export function getNextRuns(expression: string, baseTime?: Date, count: number = 5): Date[] {
  const parsed = parseCron(expression, baseTime)
  if (!parsed || !parsed.success || !parsed.fields) return []

  // Build a quick closure to test a Date against the expression
  const fieldSet = parsed.fields
  const getVal = (d: Date, idx: number) => {
    // 0: second, 1: minute, 2: hour, 3: day, 4: month, 5: weekday
    switch (idx) {
      case 0: return d.getSeconds()
      case 1: return d.getMinutes()
      case 2: return d.getHours()
      case 3: return d.getDate()
      case 4: return d.getMonth() + 1
      case 5: return d.getDay()
      default: return 0
    }
  }

  const matches = (d: Date) => {
    for (let i = 0; i < 6; i++) {
      const val = getVal(d, i)
      const fieldVal = fieldSet[i].value
      const { min, max } = FIELD_RANGES[(['second','minute','hour','day','month','weekday'] as FieldType[])[i]]
      if (!dateMatchesField(val, fieldVal, min, max)) return false
    }
    return true
  }

  const results: Date[] = []
  // Start from baseTime or now
  let t = baseTime ? new Date(baseTime.getTime()) : new Date()
  // Ensure we search strictly after the base time
  t = new Date(t.getTime() + 1000)
  while (results.length < count) {
    if (matches(t)) {
      results.push(new Date(t.getTime()))
    }
    t = new Date(t.getTime() + 1000)
  }
  return results
}
