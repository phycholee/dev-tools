// tests/unicode-codec-test/unit/unicode.test.ts
import { describe, it, expect } from 'vitest'
import {
  encodeUnicode,
  decodeUnicode,
} from '../../../src/tools/unicode-codec/unicode'

describe('Unicode Codec Utility', () => {
  describe('encodeUnicode all mode', () => {
    it('should encode ASCII text as UTF-16 code units', () => {
      const result = encodeUnicode('abc', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\u0061\\u0062\\u0063')
    })

    it('should encode mixed ASCII and Chinese text', () => {
      const result = encodeUnicode('abc你好', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\u0061\\u0062\\u0063\\u4F60\\u597D')
    })

    it('should encode spaces and line breaks', () => {
      const result = encodeUnicode('A B\nC', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\u0041\\u0020\\u0042\\u000A\\u0043')
    })

    it('should encode empty string as empty output', () => {
      const result = encodeUnicode('', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })

    it('should encode non-BMP characters as UTF-16 surrogate pairs', () => {
      const result = encodeUnicode('😀', 'all')
      expect(result.success).toBe(true)
      expect(result.output).toBe('\\uD83D\\uDE00')
    })
  })

  describe('encodeUnicode non-ascii mode', () => {
    it('should keep ASCII text unchanged', () => {
      const result = encodeUnicode('abc', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc')
    })

    it('should encode only non-ASCII characters', () => {
      const result = encodeUnicode('abc你好', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc\\u4F60\\u597D')
    })

    it('should keep ASCII punctuation, spaces, and line breaks unchanged', () => {
      const result = encodeUnicode('a=1 & b=2\nOK', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('a=1 & b=2\nOK')
    })

    it('should encode emoji surrogate pairs and Chinese text', () => {
      const result = encodeUnicode('A😀中', 'non-ascii')
      expect(result.success).toBe(true)
      expect(result.output).toBe('A\\uD83D\\uDE00\\u4E2D')
    })
  })

  describe('decodeUnicode', () => {
    it('should decode standard Unicode escape sequences', () => {
      const result = decodeUnicode('\\u4F60\\u597D')
      expect(result.success).toBe(true)
      expect(result.output).toBe('你好')
    })

    it('should decode ASCII escape sequences', () => {
      const result = decodeUnicode('\\u0061\\u0062\\u0063')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc')
    })

    it('should decode mixed plain text and Unicode escape sequences', () => {
      const result = decodeUnicode('abc\\u4F60\\u597D')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc你好')
    })

    it('should decode surrogate pairs into emoji', () => {
      const result = decodeUnicode('\\uD83D\\uDE00')
      expect(result.success).toBe(true)
      expect(result.output).toBe('😀')
    })

    it('should preserve invalid Unicode escape sequences', () => {
      expect(decodeUnicode('\\uZZZZ').output).toBe('\\uZZZZ')
      expect(decodeUnicode('\\u4F6').output).toBe('\\u4F6')
      expect(decodeUnicode('\\u').output).toBe('\\u')
      expect(decodeUnicode('abc\\uZZZZ').output).toBe('abc\\uZZZZ')
    })

    it('should return plain text unchanged', () => {
      const result = decodeUnicode('abc你好')
      expect(result.success).toBe(true)
      expect(result.output).toBe('abc你好')
    })

    it('should return empty string for empty input', () => {
      const result = decodeUnicode('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })
  })
})