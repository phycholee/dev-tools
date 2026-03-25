// tests/url-codec-test/unit/url.test.ts
import { describe, it, expect } from 'vitest'
import {
  encodeURIComponentSafe,
  encodeURISafe,
  decodeUrlSafe,
} from '../../../src/tools/url-codec/url'

describe('URL Codec Utility', () => {
  describe('encodeURIComponentSafe', () => {
    it('should encode Chinese characters', () => {
      const result = encodeURIComponentSafe('中文')
      expect(result.success).toBe(true)
      expect(result.output).toBe('%E4%B8%AD%E6%96%87')
    })

    it('should encode spaces as %20', () => {
      const result = encodeURIComponentSafe('hello world')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello%20world')
    })

    it('should encode & = + characters', () => {
      const result = encodeURIComponentSafe('a=1&b=2')
      expect(result.success).toBe(true)
      expect(result.output).toBe('a%3D1%26b%3D2')
    })

    it('should return empty string for empty input', () => {
      const result = encodeURIComponentSafe('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })

    it('should re-encode already encoded text (% becomes %25)', () => {
      const result = encodeURIComponentSafe('%20')
      expect(result.success).toBe(true)
      expect(result.output).toBe('%2520')
    })
  })

  describe('encodeURISafe', () => {
    it('should preserve URL structural characters', () => {
      const url = 'https://example.com/path?a=1&b=2#section'
      const result = encodeURISafe(url)
      expect(result.success).toBe(true)
      expect(result.output).toContain('://')
      expect(result.output).toContain('?')
      expect(result.output).toContain('&')
      expect(result.output).toContain('=')
      expect(result.output).toContain('#')
      expect(result.output).toContain('/')
    })

    it('should encode Chinese characters in a full URL', () => {
      const result = encodeURISafe('https://example.com/中文')
      expect(result.success).toBe(true)
      expect(result.output).toContain('https://example.com/')
      expect(result.output).not.toContain('中文')
    })

    it('KEY DIFFERENCE: should preserve = and & unlike encodeURIComponent', () => {
      const input = 'a=1&b=2'
      const uriComponentResult = encodeURIComponentSafe(input)
      const uriResult = encodeURISafe(input)

      // encodeURIComponent encodes = and &
      expect(uriComponentResult.output).toBe('a%3D1%26b%3D2')
      // encodeURI preserves = and &
      expect(uriResult.output).toBe('a=1&b=2')
    })
  })

  describe('decodeUrlSafe', () => {
    it('should decode standard %XX sequences', () => {
      const result = decodeUrlSafe('hello%20world')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello world')
    })

    it('should decode Chinese characters', () => {
      const result = decodeUrlSafe('%E4%B8%AD%E6%96%87')
      expect(result.success).toBe(true)
      expect(result.output).toBe('中文')
    })

    it('should return plain text unchanged', () => {
      const result = decodeUrlSafe('hello world')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello world')
    })

    it('should decode %23 to #', () => {
      // decodeURIComponent('%23') → '#' directly (no fallback needed)
      const result = decodeUrlSafe('%23')
      expect(result.success).toBe(true)
      expect(result.output).toBe('#')
    })

    it('should return error for invalid sequences like %GG', () => {
      // Both decodeURIComponent and decodeURI throw URIError for %GG
      const result = decodeUrlSafe('%GG')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.length).toBeGreaterThan(0)
    })
  })
})
