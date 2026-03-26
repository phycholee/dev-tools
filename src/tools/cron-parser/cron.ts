// Cron parser utilities
// Supports multiple formats: Linux 5/6 fields, Quartz 6/7 fields
// Provides: validateField, parseCron, generateCron, getNextRuns

export type FieldType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'weekday' | 'year'

export interface CronField {
  value: string
  label: string        // 中文标签：秒、分、时、日、月、周、年
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
  format?: CronFormat
}

// Cron 格式定义
export interface CronFormatConfig {
  name: string           // 显示名称
  fieldCount: number     // 字段数量
  fields: FieldType[]    // 字段类型顺序
  supportsQuestion: boolean  // 是否支持 ? 字符
  supportsL: boolean     // 是否支持 L 字符
  supportsW: boolean     // 是否支持 W 字符
  supportsHash: boolean  // 是否支持 # 字符
  example: string        // 示例表达式
}

export type CronFormat = 'linux-5' | 'linux-6' | 'quartz-6' | 'quartz-7'

// 格式配置
export const CRON_FORMATS: Record<CronFormat, CronFormatConfig> = {
  'linux-5': {
    name: 'Linux (5位)',
    fieldCount: 5,
    fields: ['minute', 'hour', 'day', 'month', 'weekday'],
    supportsQuestion: false,
    supportsL: false,
    supportsW: false,
    supportsHash: false,
    example: '*/5 * * * *'
  },
  'linux-6': {
    name: 'Linux (6位)',
    fieldCount: 6,
    fields: ['second', 'minute', 'hour', 'day', 'month', 'weekday'],
    supportsQuestion: false,
    supportsL: false,
    supportsW: false,
    supportsHash: false,
    example: '0 */5 * * * *'
  },
  'quartz-6': {
    name: 'Quartz/Spring (6位)',
    fieldCount: 6,
    fields: ['second', 'minute', 'hour', 'day', 'month', 'weekday'],
    supportsQuestion: true,
    supportsL: true,
    supportsW: true,
    supportsHash: true,
    example: '0 0/5 * * * ?'
  },
  'quartz-7': {
    name: 'Quartz/Spring (7位)',
    fieldCount: 7,
    fields: ['second', 'minute', 'hour', 'day', 'month', 'weekday', 'year'],
    supportsQuestion: true,
    supportsL: true,
    supportsW: true,
    supportsHash: true,
    example: '0 0/5 * * * ? *'
  }
}

// Helper range definitions per field
const FIELD_RANGES: Record<FieldType, { min: number; max: number; label: string }> = {
  second: { min: 0, max: 59, label: '秒' },
  minute: { min: 0, max: 59, label: '分' },
  hour: { min: 0, max: 23, label: '时' },
  day: { min: 1, max: 31, label: '日' },
  month: { min: 1, max: 12, label: '月' },
  weekday: { min: 0, max: 6, label: '周' },
  year: { min: 1970, max: 2099, label: '年' }
}

// 自动检测 cron 格式
export function detectCronFormat(expression: string): CronFormat {
  const parts = expression.trim().split(/\s+/)
  const count = parts.length

  if (count === 5) return 'linux-5'
  if (count === 6) {
    // 检查是否包含 Quartz 特殊字符
    const hasQuartzChars = parts.some(p => p.includes('?') || p.includes('L') || p.includes('W') || p.includes('#'))
    return hasQuartzChars ? 'quartz-6' : 'linux-6'
  }
  if (count === 7) return 'quartz-7'

  // 默认返回 linux-5
  return 'linux-5'
}

// Validate a single field value string for a given field type and format
export function validateField(
  value: string,
  fieldType: FieldType,
  format: CronFormat = 'linux-6'
): { valid: boolean; error?: string } {
  const { min, max } = FIELD_RANGES[fieldType]
  const formatConfig = CRON_FORMATS[format]

  if (!value || value.trim().length === 0) {
    return { valid: false, error: '字段不能为空' }
  }

  const inRange = (n: number) => n >= min && n <= max

  // Quartz 特殊字符
  if (value === '?') {
    if (!formatConfig.supportsQuestion) {
      return { valid: false, error: '? 字符仅 Quartz 格式支持' }
    }
    if (fieldType !== 'day' && fieldType !== 'weekday') {
      return { valid: false, error: '? 字符只能用于日或周字段' }
    }
    return { valid: true }
  }

  // L 字符（最后）
  if (value === 'L' || value.endsWith('L')) {
    if (!formatConfig.supportsL) {
      return { valid: false, error: 'L 字符仅 Quartz 格式支持' }
    }
    if (fieldType !== 'day' && fieldType !== 'weekday') {
      return { valid: false, error: 'L 字符只能用于日或周字段' }
    }
    return { valid: true }
  }

  // W 字符（工作日）
  if (value.endsWith('W')) {
    if (!formatConfig.supportsW) {
      return { valid: false, error: 'W 字符仅 Quartz 格式支持' }
    }
    if (fieldType !== 'day') {
      return { valid: false, error: 'W 字符只能用于日字段' }
    }
    return { valid: true }
  }

  // # 字符（第几个）
  if (value.includes('#')) {
    if (!formatConfig.supportsHash) {
      return { valid: false, error: '# 字符仅 Quartz 格式支持' }
    }
    if (fieldType !== 'weekday') {
      return { valid: false, error: '# 字符只能用于周字段' }
    }
    const [dayStr, nthStr] = value.split('#')
    const day = Number(dayStr)
    const nth = Number(nthStr)
    if (!Number.isFinite(day) || day < 1 || day > 7) {
      return { valid: false, error: '# 前的日期值应为 1-7' }
    }
    if (!Number.isFinite(nth) || nth < 1 || nth > 5) {
      return { valid: false, error: '# 后的序号应为 1-5' }
    }
    return { valid: true }
  }

  // 通配符
  if (value === '*') return { valid: true }

  // 列表
  const parts = value.split(',')
  for (const part of parts) {
    const p = part.trim()
    if (p.length === 0) return { valid: false, error: '列表包含空值' }

    // 步长
    if (p.includes('/')) {
      const [base, stepStr] = p.split('/')
      const step = Number(stepStr)
      if (!Number.isFinite(step) || step <= 0) {
        return { valid: false, error: '步长必须为正整数' }
      }
      if (base === '*') continue
      if (base.includes('-')) {
        const [aStr, bStr] = base.split('-')
        const a = Number(aStr), b = Number(bStr)
        if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) {
          return { valid: false, error: '范围格式错误' }
        }
        if (a < min || b > max) {
          return { valid: false, error: `值超出范围 (${min}-${max})` }
        }
        continue
      }
      const a = Number(base)
      if (!Number.isFinite(a) || a < min || a > max) {
        return { valid: false, error: `值超出范围 (${min}-${max})` }
      }
      continue
    }

    // 范围
    if (p.includes('-')) {
      const [aStr, bStr] = p.split('-')
      const a = Number(aStr), b = Number(bStr)
      if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) {
        return { valid: false, error: '范围格式错误' }
      }
      if (a < min || b > max) {
        return { valid: false, error: `值超出范围 (${min}-${max})` }
      }
      continue
    }

    // 单个值
    const val = Number(p)
    if (!Number.isFinite(val) || !inRange(val)) {
      return { valid: false, error: `值超出范围 (${min}-${max})` }
    }
  }

  return { valid: true }
}

function describeValue(fieldType: FieldType, value: string): string {
  const { label } = FIELD_RANGES[fieldType]

  // Quartz 特殊字符
  if (value === '?') return '不指定'
  if (value === 'L') return '最后一天'
  if (value.endsWith('L') && value !== 'L') return `最后${value}`
  if (value.endsWith('W')) return `${value}最近工作日`
  if (value.includes('#')) {
    const [day, nth] = value.split('#')
    return `第${nth}个周${day}`
  }

  // 标准字符
  if (value === '*') return `每${label}`
  if (value.startsWith('*/')) {
    const step = value.slice(2)
    return `每${step}${label}`
  }
  if (value.includes('-') && !value.includes('/')) {
    return `${value}范围`
  }
  if (value.includes('-') && value.includes('/')) {
    return `${value}`
  }
  if (value.includes(',')) {
    return `${value}`
  }
  return `第${value}${label}`
}

export function parseCron(expression: string, baseTime?: Date, format?: CronFormat): CronParseResult {
  void baseTime

  // 自动检测格式
  const detectedFormat = format || detectCronFormat(expression)
  const formatConfig = CRON_FORMATS[detectedFormat]

  const parts = expression.trim().split(/\s+/)

  // 验证字段数量
  if (parts.length !== formatConfig.fieldCount) {
    return {
      success: false,
      error: `${formatConfig.name} 格式需要 ${formatConfig.fieldCount} 个字段，当前有 ${parts.length} 个`,
      format: detectedFormat
    }
  }

  // Quartz 格式验证：日和周不能同时为 *
  if (formatConfig.supportsQuestion) {
    const dayIndex = formatConfig.fields.indexOf('day')
    const weekdayIndex = formatConfig.fields.indexOf('weekday')
    const dayValue = parts[dayIndex]
    const weekdayValue = parts[weekdayIndex]

    if (dayValue === '*' && weekdayValue === '*') {
      return {
        success: false,
        error: 'Quartz 格式中，日和周字段不能同时为 *，其中一个必须为 ?',
        format: detectedFormat
      }
    }
  }

  const cronFields: CronField[] = []
  let allValid = true
  const descriptionParts: string[] = []

  for (let i = 0; i < formatConfig.fields.length; i++) {
    const value = parts[i]
    const fieldType = formatConfig.fields[i]
    const v = validateField(value, fieldType, detectedFormat)
    const { label } = FIELD_RANGES[fieldType]

    const field: CronField = {
      value,
      label,
      description: describeValue(fieldType, value),
      valid: v.valid,
      error: v.error
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
    format: detectedFormat
  }

  // 计算下次执行时间
  if (allValid) {
    const nextRunsFromFields: Date[] = []
    let t = baseTime ? new Date(baseTime.getTime()) : new Date()
    t = new Date(t.getTime() + 1000)

    while (nextRunsFromFields.length < 5) {
      let matchesAll = true
      for (let i = 0; i < formatConfig.fields.length; i++) {
        const fieldVal = cronFields[i].value
        const fieldType = formatConfig.fields[i]
        const { min, max } = FIELD_RANGES[fieldType]

        let currentVal: number
        switch (fieldType) {
          case 'second': currentVal = t.getSeconds(); break
          case 'minute': currentVal = t.getMinutes(); break
          case 'hour': currentVal = t.getHours(); break
          case 'day': currentVal = t.getDate(); break
          case 'month': currentVal = t.getMonth() + 1; break
          case 'weekday': currentVal = t.getDay(); break
          case 'year': currentVal = t.getFullYear(); break
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

      // 防止无限循环
      if (nextRunsFromFields.length === 0 && t.getTime() - (baseTime?.getTime() || Date.now()) > 365 * 24 * 60 * 60 * 1000) {
        break
      }

      t = new Date(t.getTime() + 1000)
    }

    result.nextRuns = nextRunsFromFields
  }

  return result
}

export function generateCron(fields: string[]): string {
  return fields.join(' ')
}

function dateMatchesField(value: number, fieldValue: string, min: number, max: number): boolean {
  // Quartz 特殊字符
  if (fieldValue === '?' || fieldValue === '*') return true
  if (fieldValue === 'L') return value === max  // 简化：假设最后一天
  if (fieldValue.endsWith('L')) return true  // 简化处理
  if (fieldValue.endsWith('W')) return true  // 简化处理
  if (fieldValue.includes('#')) return true  // 简化处理

  // 标准字符
  if (fieldValue.includes('/')) {
    const [base, stepStr] = fieldValue.split('/')
    const step = Number(stepStr)
    if (base === '*') {
      return value % step === 0
    }
    if (base.includes('-')) {
      const [aStr, bStr] = base.split('-')
      const a = Number(aStr), b = Number(bStr)
      if (value < a || value > b) return false
      return ((value - a) % step) === 0
    } else {
      const a = Number(base)
      if (value < min || value > max) return false
      return ((value - a) % step) === 0
    }
  }

  if (fieldValue.includes('-')) {
    const [aStr, bStr] = fieldValue.split('-')
    const a = Number(aStr), b = Number(bStr)
    return value >= a && value <= b
  }

  if (fieldValue.includes(',')) {
    const parts = fieldValue.split(',').map(s => Number(s.trim()))
    return parts.includes(value)
  }

  const single = Number(fieldValue)
  return value === single
}

export function getNextRuns(expression: string, baseTime?: Date, count: number = 5, format?: CronFormat): Date[] {
  const parsed = parseCron(expression, baseTime, format)
  if (!parsed || !parsed.success || !parsed.fields) return []

  const fieldSet = parsed.fields
  const formatConfig = CRON_FORMATS[parsed.format || 'linux-6']

  const getVal = (d: Date, fieldType: FieldType) => {
    switch (fieldType) {
      case 'second': return d.getSeconds()
      case 'minute': return d.getMinutes()
      case 'hour': return d.getHours()
      case 'day': return d.getDate()
      case 'month': return d.getMonth() + 1
      case 'weekday': return d.getDay()
      case 'year': return d.getFullYear()
      default: return 0
    }
  }

  const matches = (d: Date) => {
    for (let i = 0; i < formatConfig.fields.length; i++) {
      const fieldType = formatConfig.fields[i]
      const val = getVal(d, fieldType)
      const fieldVal = fieldSet[i].value
      const { min, max } = FIELD_RANGES[fieldType]
      if (!dateMatchesField(val, fieldVal, min, max)) return false
    }
    return true
  }

  const results: Date[] = []
  let t = baseTime ? new Date(baseTime.getTime()) : new Date()
  t = new Date(t.getTime() + 1000)

  while (results.length < count) {
    if (matches(t)) {
      results.push(new Date(t.getTime()))
    }
    t = new Date(t.getTime() + 1000)

    // 防止无限循环
    if (results.length === 0 && t.getTime() - (baseTime?.getTime() || Date.now()) > 365 * 24 * 60 * 60 * 1000) {
      break
    }
  }

  return results
}
