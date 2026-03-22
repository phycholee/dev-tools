/**
 * Timestamp utility functions for conversion and formatting.
 * All functions are pure - no side effects.
 */

export interface TimestampResult {
  success: boolean
  output: string
  error?: string
}

export interface ParsedDateTime {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

/**
 * Common timezone list with UTC offsets
 */
export interface TimezoneOption {
  label: string
  value: string
  offset: string
}

export const TIMEZONES: TimezoneOption[] = [
  { label: 'UTC', value: 'UTC', offset: '+00:00' },
  { label: '北京时间 (CST)', value: 'Asia/Shanghai', offset: '+08:00' },
  { label: '东京时间 (JST)', value: 'Asia/Tokyo', offset: '+09:00' },
  { label: '首尔时间 (KST)', value: 'Asia/Seoul', offset: '+09:00' },
  { label: '新加坡时间 (SGT)', value: 'Asia/Singapore', offset: '+08:00' },
  { label: '洛杉矶时间 (PST)', value: 'America/Los_Angeles', offset: '-08:00' },
  { label: '纽约时间 (EST)', value: 'America/New_York', offset: '-05:00' },
  { label: '伦敦时间 (GMT)', value: 'Europe/London', offset: '+00:00' },
  { label: '巴黎时间 (CET)', value: 'Europe/Paris', offset: '+01:00' },
  { label: '莫斯科时间 (MSK)', value: 'Europe/Moscow', offset: '+03:00' },
  { label: '悉尼时间 (AEST)', value: 'Australia/Sydney', offset: '+11:00' },
]

/**
 * Get current timestamp in seconds and milliseconds
 */
export function getCurrentTimestamps(): { seconds: number; milliseconds: number } {
  const now = Date.now()
  return {
    milliseconds: now,
    seconds: Math.floor(now / 1000)
  }
}

/**
 * Detect if timestamp is in seconds or milliseconds
 * Heuristic: if timestamp is > 10^12, it's milliseconds (year 2001+)
 *            if timestamp is between 10^9 and 10^12, it's seconds (year 2001+)
 */
export function detectTimestampUnit(timestamp: number): 'seconds' | 'milliseconds' {
  // Timestamps after year 2001 in seconds are > 1,000,000,000
  // Timestamps in milliseconds are > 1,000,000,000,000
  if (timestamp > 1000000000000) {
    return 'milliseconds'
  }
  return 'seconds'
}

/**
 * Convert timestamp to Date object
 * @param timestamp - Unix timestamp
 * @param unit - 'seconds' or 'milliseconds' (auto-detected if not specified)
 */
export function timestampToDate(timestamp: number, unit?: 'seconds' | 'milliseconds'): Date {
  const detectedUnit = unit || detectTimestampUnit(timestamp)
  const ms = detectedUnit === 'seconds' ? timestamp * 1000 : timestamp
  return new Date(ms)
}

/**
 * Convert timestamp to formatted date string in specified timezone
 */
export function timestampToDateString(
  timestamp: number,
  timezone: string = 'Asia/Shanghai',
  unit?: 'seconds' | 'milliseconds'
): TimestampResult {
  try {
    const date = timestampToDate(timestamp, unit)
    
    // Check for invalid date
    if (isNaN(date.getTime())) {
      return {
        success: false,
        output: '',
        error: '无效的时间戳'
      }
    }

    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    return {
      success: true,
      output: formatter.format(date)
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Convert Date to timestamp
 */
export function dateToTimestamp(date: Date, unit: 'seconds' | 'milliseconds' = 'seconds'): number {
  const ms = date.getTime()
  return unit === 'seconds' ? Math.floor(ms / 1000) : ms
}

/**
 * Parse date string to Date object
 * Supports formats: YYYY-MM-DD HH:mm:ss, YYYY/MM/DD HH:mm:ss
 */
export function parseDateString(dateStr: string): Date | null {
  try {
    // Try native parsing first
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date
    }
    
    // Try common formats
    const normalized = dateStr.replace(/\//g, '-')
    const date2 = new Date(normalized)
    if (!isNaN(date2.getTime())) {
      return date2
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Create Date from components
 */
export function createDateFromComponents(components: ParsedDateTime, timezone: string = 'Asia/Shanghai'): Date {
  // Create date string in ISO format
  const dateStr = `${components.year}-${String(components.month).padStart(2, '0')}-${String(components.day).padStart(2, '0')}T${String(components.hours).padStart(2, '0')}:${String(components.minutes).padStart(2, '0')}:${String(components.seconds).padStart(2, '0')}.${String(components.milliseconds).padStart(3, '0')}`
  
  return new Date(dateStr)
}

/**
 * Batch convert timestamps (one per line)
 */
export function batchConvertTimestamps(
  input: string,
  timezone: string = 'Asia/Shanghai',
  unit?: 'seconds' | 'milliseconds'
): TimestampResult {
  try {
    const lines = input.trim().split('\n')
    const results: string[] = []
    const errors: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        results.push('')
        continue
      }

      const timestamp = Number(line)
      if (isNaN(timestamp)) {
        errors.push(`第 ${i + 1} 行: "${line}" 不是有效的时间戳`)
        results.push(`❌ 无效`)
        continue
      }

      const result = timestampToDateString(timestamp, timezone, unit)
      if (result.success) {
        results.push(result.output)
      } else {
        errors.push(`第 ${i + 1} 行: ${result.error}`)
        results.push(`❌ ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      output: results.join('\n'),
      error: errors.length > 0 ? errors.join('; ') : undefined
    }
  } catch (e) {
    const err = e as Error
    return {
      success: false,
      output: '',
      error: err.message
    }
  }
}

/**
 * Format date to display string with timezone info
 */
export function formatDateTimeWithTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  })
  
  return formatter.format(date)
}

/**
 * Get current date components in specified timezone
 */
export function getCurrentDateInTimezone(timezone: string): ParsedDateTime {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  })
  
  const parts = formatter.formatToParts(now)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'
  
  return {
    year: parseInt(getPart('year')),
    month: parseInt(getPart('month')),
    day: parseInt(getPart('day')),
    hours: parseInt(getPart('hour')),
    minutes: parseInt(getPart('minute')),
    seconds: parseInt(getPart('second')),
    milliseconds: now.getMilliseconds()
  }
}
