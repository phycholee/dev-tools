/**
 * Regex utility functions for matching and explaining.
 * All functions are pure - no side effects.
 */

export interface RegexValidation {
  valid: boolean
  error?: string
}

export interface MatchItem {
  value: string
  index: number
  length: number
  groups?: string[]
}

export interface RegexMatchResult {
  success: boolean
  matches: MatchItem[]
  error?: string
}

export interface RegexPart {
  pattern: string
  description: string
}

export interface RegexExplanation {
  success: boolean
  parts: RegexPart[]
  error?: string
}

/**
 * Validate regex syntax
 */
export function validateRegex(pattern: string, flags: string): RegexValidation {
  try {
    new RegExp(pattern, flags)
    return { valid: true }
  } catch (e) {
    const err = e as Error
    return { valid: false, error: err.message }
  }
}

/**
 * Execute regex matching
 */
export function matchRegex(text: string, pattern: string, flags: string): RegexMatchResult {
  try {
    if (!pattern) {
      return { success: true, matches: [] }
    }
    const regex = new RegExp(pattern, flags)
    const matches: MatchItem[] = []
    let match: RegExpExecArray | null

    if (flags.includes('g')) {
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          value: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.length > 1 ? match.slice(1) : undefined
        })
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }
    } else {
      match = regex.exec(text)
      if (match) {
        matches.push({
          value: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.length > 1 ? match.slice(1) : undefined
        })
      }
    }

    return { success: true, matches }
  } catch (e) {
    const err = e as Error
    return { success: false, matches: [], error: err.message }
  }
}

/**
 * Explain regex pattern
 */
export function explainRegex(pattern: string): RegexExplanation {
  try {
    // Validate first
    new RegExp(pattern)
    
    const parts: RegexPart[] = []
    const explanations: [RegExp, string][] = [
      [/^\\^/, '字符串开头'],
      [/\\\$/, '字符串结尾'],
      [/\\d/, '数字 [0-9]'],
      [/\\D/, '非数字'],
      [/\\w/, '单词字符 [a-zA-Z0-9_]'],
      [/\\W/, '非单词字符'],
      [/\\s/, '空白字符'],
      [/\\S/, '非空白字符'],
      [/\\b/, '单词边界'],
      [/\\B/, '非单词边界'],
      [/\\n/, '换行符'],
      [/\\r/, '回车符'],
      [/\\t/, '制表符'],
      [/\./, '任意字符（除换行符）'],
      [/\[.*?\]/, '字符集合'],
      [/\(\?:/, '非捕获组'],
      [/\(/, '捕获组'],
      [/\)/, '组结束'],
      [/\|/, '或运算'],
      [/\*/, '0次或多次'],
      [/\+/, '1次或多次'],
      [/\?/, '0次或1次'],
      [/\{(\d+)(,)?(\d+)?\}/, '重复次数'],
    ]

    for (const [regex, desc] of explanations) {
      const match = pattern.match(regex)
      if (match) {
        parts.push({ pattern: match[0], description: desc })
      }
    }

    if (parts.length === 0) {
      parts.push({ pattern, description: '普通字符匹配' })
    }

    return { success: true, parts }
  } catch (e) {
    const err = e as Error
    return { success: false, parts: [], error: err.message }
  }
}
