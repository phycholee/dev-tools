import { describe, it, expect } from 'vitest'
import {
  encodeBase64,
  decodeBase64,
  detectBase64Format,
  type Base64Format,
} from '../../../src/tools/base64-codec/base64'

describe('Base64 Codec Utility', () => {
  describe('encodeBase64', () => {
    describe('standard format', () => {
      it('should encode ASCII text', () => {
        const result = encodeBase64('hello', 'standard')
        expect(result.success).toBe(true)
        expect(result.output).toBe('aGVsbG8=')
      })

      it('should encode Chinese characters (UTF-8)', () => {
        const result = encodeBase64('中文', 'standard')
        expect(result.success).toBe(true)
        expect(result.output).toBe('5Lit5paH')
      })

      it('should encode empty string', () => {
        const result = encodeBase64('', 'standard')
        expect(result.success).toBe(true)
        expect(result.output).toBe('')
      })

      it('should encode multi-line text', () => {
        const result = encodeBase64('line1\nline2', 'standard')
        expect(result.success).toBe(true)
        expect(result.output).toBe('bGluZTEKbGluZTI=')
      })

      it('should encode special characters', () => {
        const result = encodeBase64('a+b/c=d', 'standard')
        expect(result.success).toBe(true)
        expect(result.output).toBe('YStiL2M9ZA==')
      })

      it('should encode emoji', () => {
        const result = encodeBase64('👋', 'standard')
        expect(result.success).toBe(true)
        expect(result.output).toBe('8J+Riw==')
      })
    })

    describe('url-safe format', () => {
      it('should use - instead of +', () => {
        const result = encodeBase64('>>>', 'url-safe')
        expect(result.success).toBe(true)
        expect(result.output).not.toContain('+')
        expect(result.output).toContain('-')
      })

      it('should use _ instead of /', () => {
        const result = encodeBase64('???', 'url-safe')
        expect(result.success).toBe(true)
        expect(result.output).not.toContain('/')
        expect(result.output).toContain('_')
      })

      it('should preserve padding =', () => {
        const result = encodeBase64('hello', 'url-safe')
        expect(result.success).toBe(true)
        expect(result.output).toBe('aGVsbG8=')
      })
    })

    describe('base64url format', () => {
      it('should use - instead of +', () => {
        const result = encodeBase64('>>>', 'base64url')
        expect(result.success).toBe(true)
        expect(result.output).not.toContain('+')
        expect(result.output).toContain('-')
      })

      it('should use _ instead of /', () => {
        const result = encodeBase64('???', 'base64url')
        expect(result.success).toBe(true)
        expect(result.output).not.toContain('/')
        expect(result.output).toContain('_')
      })

      it('should remove padding =', () => {
        const result = encodeBase64('hello', 'base64url')
        expect(result.success).toBe(true)
        expect(result.output).toBe('aGVsbG8')
      })
    })
  })

  describe('decodeBase64', () => {
    it('should decode standard Base64', () => {
      const result = decodeBase64('aGVsbG8=')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello')
    })

    it('should decode Chinese characters', () => {
      const result = decodeBase64('5Lit5paH')
      expect(result.success).toBe(true)
      expect(result.output).toBe('中文')
    })

    it('should decode URL-safe Base64', () => {
      const result = decodeBase64('Pj4-')
      expect(result.success).toBe(true)
      expect(result.output).toBe('>>>')
    })

    it('should decode base64url (no padding)', () => {
      const result = decodeBase64('aGVsbG8')
      expect(result.success).toBe(true)
      expect(result.output).toBe('hello')
    })

    it('should decode empty string', () => {
      const result = decodeBase64('')
      expect(result.success).toBe(true)
      expect(result.output).toBe('')
    })

    it('should return error for invalid Base64', () => {
      const result = decodeBase64('not valid base64!!!')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should decode emoji', () => {
      const result = decodeBase64('8J+Riw==')
      expect(result.success).toBe(true)
      expect(result.output).toBe('👋')
    })
  })

  describe('detectBase64Format', () => {
    it('should detect standard Base64', () => {
      const format = detectBase64Format('aGVsbG8=')
      expect(format).toBe('standard')
    })

    it('should detect URL-safe Base64 with -', () => {
      const format = detectBase64Format('a-b_c=')
      expect(format).toBe('url-safe')
    })

    it('should detect base64url without padding', () => {
      const format = detectBase64Format('aGVsbG8')
      expect(format).toBe('base64url')
    })
  })
})
