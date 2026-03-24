import { describe, it, expect } from 'vitest'
import {
  detectTimestampUnit,
  timestampToDate,
  timestampToDateString,
  dateToTimestamp,
  parseDateString,
  getCurrentTimestamps,
  batchConvertTimestamps,
} from '../../../src/tools/timestamp-converter/timestamp'

describe('Timestamp Converter Utility', () => {
  describe('detectTimestampUnit', () => {
    it('should detect milliseconds for large timestamps', () => {
      // 2024-03-20 in milliseconds
      expect(detectTimestampUnit(1710912345000)).toBe('milliseconds')
    })

    it('should detect seconds for normal timestamps', () => {
      // 2024-03-20 in seconds
      expect(detectTimestampUnit(1710912345)).toBe('seconds')
    })
  })

  describe('timestampToDate', () => {
    it('should convert seconds timestamp to Date', () => {
      const date = timestampToDate(1710912345, 'seconds')
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(2) // March (0-indexed)
    })

    it('should convert milliseconds timestamp to Date', () => {
      const date = timestampToDate(1710912345000, 'milliseconds')
      expect(date.getFullYear()).toBe(2024)
    })

    it('should auto-detect unit', () => {
      const date = timestampToDate(1710912345000)
      expect(date.getFullYear()).toBe(2024)
    })
  })

  describe('timestampToDateString', () => {
    it('should convert timestamp to formatted date string', () => {
      const result = timestampToDateString(1710912345, 'UTC', 'seconds')
      expect(result.success).toBe(true)
      expect(result.output).toContain('2024')
    })

    it('should handle invalid timestamp', () => {
      const result = timestampToDateString(NaN, 'UTC')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should respect timezone parameter', () => {
      const utcResult = timestampToDateString(1710912345, 'UTC', 'seconds')
      const shanghaiResult = timestampToDateString(1710912345, 'Asia/Shanghai', 'seconds')
      
      expect(utcResult.success).toBe(true)
      expect(shanghaiResult.success).toBe(true)
      // Shanghai is 8 hours ahead of UTC
      expect(utcResult.output).not.toBe(shanghaiResult.output)
    })
  })

  describe('dateToTimestamp', () => {
    it('should convert Date to seconds timestamp', () => {
      const date = new Date('2024-03-20T12:00:00Z')
      const timestamp = dateToTimestamp(date, 'seconds')
      expect(timestamp).toBeGreaterThan(1710000000)
    })

    it('should convert Date to milliseconds timestamp', () => {
      const date = new Date('2024-03-20T12:00:00Z')
      const timestamp = dateToTimestamp(date, 'milliseconds')
      expect(timestamp).toBeGreaterThan(1710000000000)
    })
  })

  describe('parseDateString', () => {
    it('should parse ISO date string', () => {
      const date = parseDateString('2024-03-20 12:00:00')
      expect(date).not.toBeNull()
      expect(date?.getFullYear()).toBe(2024)
    })

    it('should parse slash-separated date string', () => {
      const date = parseDateString('2024/03/20 12:00:00')
      expect(date).not.toBeNull()
    })

    it('should return null for invalid date string', () => {
      const date = parseDateString('invalid-date')
      expect(date).toBeNull()
    })
  })

  describe('getCurrentTimestamps', () => {
    it('should return current timestamps', () => {
      const result = getCurrentTimestamps()
      expect(result.seconds).toBeGreaterThan(0)
      expect(result.milliseconds).toBeGreaterThan(result.seconds)
      expect(result.milliseconds).toBeGreaterThanOrEqual(result.seconds * 1000)
    })
  })

  describe('batchConvertTimestamps', () => {
    it('should convert multiple timestamps', () => {
      const input = '1710912345\n1710912346\n1710912347'
      const result = batchConvertTimestamps(input, 'UTC', 'seconds')
      expect(result.success).toBe(true)
      const lines = result.output.split('\n')
      expect(lines).toHaveLength(3)
    })

    it('should handle empty lines', () => {
      const input = '1710912345\n\n1710912347'
      const result = batchConvertTimestamps(input, 'UTC', 'seconds')
      expect(result.success).toBe(true)
    })

    it('should report errors for invalid lines', () => {
      const input = '1710912345\ninvalid\n1710912347'
      const result = batchConvertTimestamps(input, 'UTC', 'seconds')
      expect(result.success).toBe(false)
      expect(result.error).toContain('第 2 行')
    })
  })
})
