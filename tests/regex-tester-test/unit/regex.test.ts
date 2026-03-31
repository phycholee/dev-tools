import { describe, it, expect } from 'vitest'
import {
  validateRegex,
  matchRegex,
  explainRegex,
} from '../../../src/tools/regex-tester/regex'

describe('Regex Tester Utility', () => {
  describe('validateRegex', () => {
    it('should return valid for correct regex', () => {
      const result = validateRegex('\\d+', 'g')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid regex', () => {
      const result = validateRegex('[invalid', 'g')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return valid for empty pattern', () => {
      const result = validateRegex('', 'g')
      expect(result.valid).toBe(true)
    })
  })

  describe('matchRegex', () => {
    it('should find basic matches', () => {
      const result = matchRegex('hello 123 world 456', '\\d+', 'g')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(2)
      expect(result.matches[0].value).toBe('123')
      expect(result.matches[0].index).toBe(6)
      expect(result.matches[1].value).toBe('456')
      expect(result.matches[1].index).toBe(16)
    })

    it('should handle case-insensitive flag', () => {
      const result = matchRegex('Hello HELLO hello', 'hello', 'gi')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(3)
    })

    it('should extract capture groups', () => {
      const result = matchRegex('2026-03-31', '(\\d{4})-(\\d{2})-(\\d{2})', 'g')
      expect(result.success).toBe(true)
      expect(result.matches[0].groups).toEqual(['2026', '03', '31'])
    })

    it('should return empty matches for no match', () => {
      const result = matchRegex('hello world', '\\d+', 'g')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(0)
    })

    it('should return error for invalid regex', () => {
      const result = matchRegex('test', '[invalid', 'g')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty text', () => {
      const result = matchRegex('', '\\d+', 'g')
      expect(result.success).toBe(true)
      expect(result.matches).toHaveLength(0)
    })
  })

  describe('explainRegex', () => {
    it('should explain basic patterns', () => {
      const result = explainRegex('^\\d+$')
      expect(result.success).toBe(true)
      expect(result.parts.length).toBeGreaterThan(0)
    })

    it('should explain character classes', () => {
      const result = explainRegex('[a-z]')
      expect(result.success).toBe(true)
      expect(result.parts.length).toBeGreaterThan(0)
    })

    it('should explain quantifiers', () => {
      const result = explainRegex('a{2,5}')
      expect(result.success).toBe(true)
      expect(result.parts.length).toBeGreaterThan(0)
    })

    it('should return error for invalid regex', () => {
      const result = explainRegex('[invalid')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
