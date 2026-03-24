import { describe, it, expect } from 'vitest'
import {
  formatJson,
  compressJson,
  escapeJson,
  unescapeJson,
  validateJson,
  highlightJson,
} from '@/tools/json-formatter/json'

describe('JSON Formatter Utility', () => {
  describe('formatJson', () => {
    it('should format valid JSON with default indent', () => {
      const input = '{"name":"test","value":123}'
      const result = formatJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\n')
      expect(result.output).toContain('  "name"')
    })

    it('should format JSON with custom indent', () => {
      const input = '{"a":1}'
      const result = formatJson(input, 4)
      expect(result.success).toBe(true)
      expect(result.output).toContain('    "a"')
    })

    it('should return error for invalid JSON', () => {
      const input = '{invalid}'
      const result = formatJson(input)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty object', () => {
      const result = formatJson('{}')
      expect(result.success).toBe(true)
      expect(result.output).toBe('{}')
    })

    it('should handle nested objects', () => {
      const input = '{"outer":{"inner":"value"}}'
      const result = formatJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('"outer"')
      expect(result.output).toContain('"inner"')
    })

    it('should handle arrays', () => {
      const input = '[1,2,3]'
      const result = formatJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\n')
    })
  })

  describe('compressJson', () => {
    it('should compress formatted JSON to single line', () => {
      const input = '{\n  "a": 1\n}'
      const result = compressJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toBe('{"a":1}')
    })

    it('should return error for invalid JSON', () => {
      const result = compressJson('invalid')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle already compressed JSON', () => {
      const input = '{"a":1}'
      const result = compressJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toBe('{"a":1}')
    })
  })

  describe('escapeJson', () => {
    it('should escape valid JSON string with newline', () => {
      // Valid JSON string containing newline character
      const input = '{"text":"hello\\nworld"}'
      const result = escapeJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\\\\n')
    })

    it('should escape valid JSON object', () => {
      const input = '{"a":1}'
      const result = escapeJson(input)
      expect(result.success).toBe(true)
      expect(result.output).toContain('\\"a\\"')
    })

    it('should return error for invalid JSON', () => {
      const result = escapeJson('not valid json')
      expect(result.success).toBe(false)
    })
  })

  describe('unescapeJson', () => {
    it('should unescape escaped JSON string', () => {
      const input = '"{\\"a\\":1}"'
      const result = unescapeJson(input)
      expect(result.success).toBe(true)
    })

    it('should handle plain JSON object', () => {
      const input = '{"a":1}'
      const result = unescapeJson(input)
      expect(result.success).toBe(true)
    })

    it('should return error for invalid unescaped JSON', () => {
      const input = '"{invalid}"'
      const result = unescapeJson(input)
      expect(result.success).toBe(false)
    })
  })

  describe('validateJson', () => {
    it('should return success for valid JSON object', () => {
      const result = validateJson('{"a":1}')
      expect(result.success).toBe(true)
    })

    it('should return success for valid JSON array', () => {
      const result = validateJson('[1,2,3]')
      expect(result.success).toBe(true)
    })

    it('should return success for valid JSON string', () => {
      const result = validateJson('"string"')
      expect(result.success).toBe(true)
    })

    it('should return success for valid JSON number', () => {
      const result = validateJson('123')
      expect(result.success).toBe(true)
    })

    it('should return error for invalid JSON', () => {
      const result = validateJson('{invalid}')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return error for empty string', () => {
      const result = validateJson('')
      expect(result.success).toBe(false)
    })
  })

  describe('highlightJson', () => {
    it('should escape HTML entities', () => {
      const input = '{"key":"<value>"}'
      const result = highlightJson(input)
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('should highlight keys', () => {
      const input = '{"name":"test"}'
      const result = highlightJson(input)
      expect(result).toContain('class="json-key"')
    })

    it('should highlight string values', () => {
      const input = '{"name":"test"}'
      const result = highlightJson(input)
      expect(result).toContain('class="json-string"')
    })

    it('should highlight numbers', () => {
      const input = '{"count":42}'
      const result = highlightJson(input)
      expect(result).toContain('class="json-number"')
    })

    it('should highlight booleans', () => {
      const input = '{"active":true}'
      const result = highlightJson(input)
      expect(result).toContain('class="json-boolean"')
    })

    it('should highlight null values', () => {
      const input = '{"value":null}'
      const result = highlightJson(input)
      expect(result).toContain('class="json-null"')
    })
  })
})
