/**
 * JSON utility functions for formatting, escaping, and validation.
 * All functions are pure - no side effects.
 */

export interface JsonFormatResult {
  success: boolean
  output: string
  error?: string
}

/**
 * Beautify JSON with specified indentation
 */
export function formatJson(input: string, indent: number = 2): JsonFormatResult {
  try {
    const parsed = JSON.parse(input)
    return {
      success: true,
      output: JSON.stringify(parsed, null, indent)
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
 * Compress JSON to single line
 */
export function compressJson(input: string): JsonFormatResult {
  try {
    const parsed = JSON.parse(input)
    return {
      success: true,
      output: JSON.stringify(parsed)
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
 * Escape JSON string (for embedding in code)
 */
export function escapeJson(input: string): JsonFormatResult {
  try {
    // Validate it's valid JSON first
    JSON.parse(input)
    const escaped = input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
    return {
      success: true,
      output: `"${escaped}"`
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
 * Unescape JSON string
 */
export function unescapeJson(input: string): JsonFormatResult {
  try {
    // Remove surrounding quotes if present
    let str = input.trim()
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1)
    }
    const unescaped = str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    
    // Validate the unescaped result is valid JSON and format it
    const parsed = JSON.parse(unescaped)
    return {
      success: true,
      output: JSON.stringify(parsed, null, 2)
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
 * Validate JSON and return error details
 */
export function validateJson(input: string): JsonFormatResult {
  try {
    JSON.parse(input)
    return { success: true, output: 'Valid JSON' }
  } catch (e) {
    const err = e as Error
    return { success: false, output: '', error: err.message }
  }
}

/**
 * Syntax highlight JSON string
 * Returns HTML with span classes for coloring
 */
export function highlightJson(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Keys
    .replace(/"([^"]+)"(\s*:)/g, '<span class="json-key">"$1"</span>$2')
    // String values
    .replace(/:\s*"([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    // Numbers
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    // Booleans
    .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
    // Null
    .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
}
