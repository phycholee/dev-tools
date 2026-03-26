/**
 * Cron 字段解析结果
 */
export interface CronField {
  value: string
  label: string
  description: string
  valid: boolean
  error?: string
}

/**
 * Cron 解析结果
 */
export interface CronParseResult {
  success: boolean
  fields?: CronField[]
  description?: string
  nextRuns?: Date[]
  error?: string
}

// 字段类型定义
type FieldType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'weekday'

// 字段范围
const FIELD_RANGES: Record<FieldType, { min: number; max: number; label: string }> = {
  second: { min: 0, max: 59, label: '秒' },
  minute: { min: 0, max: 59, label: '分' },
  hour: { min: 0, max: 23, label: '时' },
  day: { min: 1, max: 31, label: '日' },
  month: { min: 1, max: 12, label: '月' },
  weekday: { min: 0, max: 6, label: '周' }
}

// 待实现
export function parseCron(expression: string, baseTime?: Date): CronParseResult {
  if (!expression || !expression.trim()) {
    return { success: false, error: '请输入 cron 表达式' }
  }

  const parts = expression.trim().split(/\s+/)

  if (parts.length !== 5 && parts.length !== 6) {
    return { success: false, error: '请输入 5 位或 6 位 cron 表达式' }
  }

  const isSixFields = parts.length === 6
  const fieldTypes: FieldType[] = isSixFields
    ? ['second', 'minute', 'hour', 'day', 'month', 'weekday']
    : ['minute', 'hour', 'day', 'month', 'weekday']

  const fields: CronField[] = []
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i]
    const fieldType = fieldTypes[i]
    const range = FIELD_RANGES[fieldType]
    const validation = validateField(value, fieldType)

    fields.push({
      value,
      label: range.label,
      description: describeField(value, fieldType),
      valid: validation.valid,
      error: validation.error
    })
  }

  // 检查是否有无效字段
  const invalidField = fields.find(f => !f.valid)
  if (invalidField) {
    return { success: false, error: invalidField.error, fields }
  }

  // 生成描述
  const description = generateDescription(fields, isSixFields)

  // 计算下次执行时间
  const nextRuns = getNextRuns(expression, baseTime, 5)

  return { success: true, fields, description, nextRuns }
}

export function generateCron(fields: string[]): string {
  if (fields.length !== 5 && fields.length !== 6) {
    throw new Error('字段数量必须是 5 或 6')
  }
  return fields.join(' ')
}

export function validateField(value: string, fieldType: FieldType): { valid: boolean; error?: string } {
  const range = FIELD_RANGES[fieldType]

  // 通配符
  if (value === '*') return { valid: true }

  // 步长 */N
  if (value.startsWith('*/')) {
    const n = parseInt(value.slice(2), 10)
    if (isNaN(n) || n <= 0) return { valid: false, error: '步长必须是正整数' }
    return { valid: true }
  }

  // 范围 N-M 或范围+步长 N-M/O
  if (value.includes('-')) {
    const parts = value.split('/')
    const [start, end] = parts[0].split('-').map(v => parseInt(v, 10))
    if (isNaN(start) || isNaN(end)) return { valid: false, error: '范围格式错误' }
    if (start < range.min || end > range.max) {
      return { valid: false, error: `${range.label}范围应为 ${range.min}-${range.max}` }
    }
    if (start > end) return { valid: false, error: '起始值不能大于结束值' }
    // 子范围内的步长由后续的 /O 表达式控制，此处只要范围合法即可
    if (parts.length > 1) {
      const step = parseInt(parts[1], 10)
      if (isNaN(step) || step <= 0) return { valid: false, error: '步长必须是正整数' }
      return { valid: true }
    }
    return { valid: true }
  }

  // 列表 N,M,O
  if (value.includes(',')) {
    const items = value.split(',').map(v => parseInt(v, 10))
    for (const item of items) {
      if (isNaN(item)) return { valid: false, error: '列表包含非法值' }
      if (item < range.min || item > range.max) {
        return { valid: false, error: `${range.label}范围应为 ${range.min}-${range.max}` }
      }
    }
    return { valid: true }
  }

  // 确切值 N
  const n = parseInt(value, 10)
  if (isNaN(n)) return { valid: false, error: '无效的数值' }
  if (n < range.min || n > range.max) {
    return { valid: false, error: `${range.label}范围应为 ${range.min}-${range.max}` }
  }
  return { valid: true }
}

export function getNextRuns(expression: string, baseTime?: Date, count: number = 5): Date[] {
  const result: Date[] = []
  const now = baseTime || new Date()
  let current = new Date(now.getTime() + 1000) // 从下一秒开始

  const parts = expression.trim().split(/\s+/)
  const isSixFields = parts.length === 6

  // 简化的实现：遍历查找匹配的时间点
  const maxIterations = 366 * 24 * 60 * 60 // 最多遍历一年
  let iterations = 0

  // 匹配辅助函数
  while (result.length < count && iterations < maxIterations) {
    if (matchesCron(current, parts, isSixFields)) {
      result.push(new Date(current))
    }
    current = new Date(current.getTime() + 1000) // 加一秒
    iterations++
  }

  return result
}

// ----------------- helpers -----------------
function describeField(value: string, fieldType: FieldType): string {
  const range = FIELD_RANGES[fieldType]
  if (value === '*') return `每${range.label}`
  if (value.startsWith('*/')) return `每 ${value.slice(2)} ${range.label}`
  if (value.includes('-')) return `${value} 范围`
  if (value.includes(',')) return `${value} 列表`
  return `第 ${value} ${range.label}`
}

function generateDescription(fields: CronField[], _isSixFields: boolean): string {
  // 简化的描述生成逻辑，覆盖常见用例
  const minute = fields.find(f => f.label === '分')
  const hour = fields.find(f => f.label === '时')
  const day = fields.find(f => f.label === '日')

  if (minute && minute.value.startsWith('*/')) {
    return `每 ${minute.value.slice(2)} 分钟执行一次`
  }
  if (minute?.value === '0' && hour?.value === '0' && day?.value === '*') {
    // 每天午夜
    return '每天 00:00'
  }
  // 兜底描述
  return '自定义 cron 表达式'
}

function matchesCron(date: Date, parts: string[], isSixFields: boolean): boolean {
  // 如果是 5 位 cron（不带秒），则仅在秒为 0 的时候才触发
  if (!isSixFields && date.getSeconds() !== 0) return false
  const values = isSixFields
    ? [date.getSeconds(), date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getDay()]
    : [date.getMinutes(), date.getHours(), date.getDate(), date.getMonth() + 1, date.getDay()]

  for (let i = 0; i < parts.length; i++) {
    if (!matchesField(values[i], parts[i])) {
      return false
    }
  }
  return true
}

function matchesField(value: number, pattern: string): boolean {
  if (pattern === '*') return true

  if (pattern.startsWith('*/')) {
    const step = parseInt(pattern.slice(2), 10)
    return value % step === 0
  }

  if (pattern.includes('-')) {
    const parts = pattern.split('/')
    const [start, end] = parts[0].split('-').map(Number)
    if (value < start || value > end) return false
    if (parts.length > 1) {
      const step = parseInt(parts[1], 10)
      return (value - start) % step === 0
    }
    return true
  }

  if (pattern.includes(',')) {
    const list = pattern.split(',').map(v => parseInt(v, 10))
    return list.includes(value)
  }

  return value === parseInt(pattern, 10)
}
